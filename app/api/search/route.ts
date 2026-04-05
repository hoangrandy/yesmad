import { NextResponse } from "next/server";
import { parseJobsFromSerper, SerperOrganicResult } from "@/lib/parseJobs";
import { ATS_PLATFORMS } from "@/lib/types";

const SERPER_ENDPOINT = "https://google.serper.dev/search";

const ROLES = [
  "data analyst",
  "technical program manager",
  "business analyst",
  "data engineer",
  "product manager",
  "product management",
  "grants manager",
  "corporate social responsibility",
  "foundation",
];

async function fetchQuery(
  apiKey: string,
  query: string,
  page: number
): Promise<SerperOrganicResult[]> {
  const response = await fetch(SERPER_ENDPOINT, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    // Serper free tier allows num: 20 but rejects num: 100 for site: queries.
    // We use pagination to fetch more safely.
    body: JSON.stringify({ q: query, num: 20, page, gl: "us", hl: "en" }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Serper API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.organic || [];
}

export async function POST(req: Request) {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "SERPER_API_KEY is not set. Add it to your .env.local file. Get a free key at serper.dev.",
      },
      { status: 500 }
    );
  }

  try {
    // Build queries for ALL roles across ALL ATS platforms
    const queries: (() => Promise<SerperOrganicResult[]>)[] = [];
    
    for (const platform of ATS_PLATFORMS) {
      for (const role of ROLES) {
        // Enforce the 'remote' keyword globally and exclude 'hybrid', 'in-office', 'on-site', and 'in-person'
        const q = `site:${platform.domain} "${role}" remote -hybrid -"in-office" -"on-site" -"in-person"`;
        // Use an async thunk so we can execute them in batches
        queries.push(() => fetchQuery(apiKey, q, 1));
      }
    }

    // Process in batches of 4 to avoid 429 Too Many Requests from Serper free tier
    const BATCH_SIZE = 4;
    const results: SerperOrganicResult[][] = [];
    
    for (let i = 0; i < queries.length; i += BATCH_SIZE) {
      const batch = queries.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map(fn => fn()));
      results.push(...batchResults);
      
      // Serper enforces a max of 5 requests per second.
      // Wait roughly 1 second between batches of 4 to stay fully compliant.
      if (i + BATCH_SIZE < queries.length) {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      }
    }

    // Merge and deduplicate by URL
    const seen = new Set<string>();
    const allOrganic: SerperOrganicResult[] = [];
    for (const batch of results) {
      for (const item of batch) {
        if (item.link && !seen.has(item.link)) {
          seen.add(item.link);
          allOrganic.push(item);
        }
      }
    }

    const jobs = parseJobsFromSerper(allOrganic, new Set());
    const searchedAt = new Date().toISOString();

    return NextResponse.json({ jobs, searchedAt });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch jobs: ${message}` },
      { status: 500 }
    );
  }
}
