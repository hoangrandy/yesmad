import { Job, RoleType, AtsDomain, ATS_PLATFORMS } from "./types";

const ROLE_PATTERNS: { role: RoleType; patterns: string[] }[] = [
  {
    role: "data analyst",
    patterns: ["data analyst"],
  },
  {
    role: "technical program manager",
    patterns: ["technical program manager", "tpm"],
  },
  {
    role: "business analyst",
    patterns: ["business analyst"],
  },
  {
    role: "data engineer",
    patterns: ["data engineer"],
  },
  {
    role: "product manager",
    patterns: ["product manager", "product management", "pm"],
  },
  {
    role: "grants manager",
    patterns: ["grants manager", "grants", "corporate social responsibility", "csr", "foundation"],
  },
];

export function detectRoleType(title: string): RoleType {
  const lower = title.toLowerCase();
  for (const { role, patterns } of ROLE_PATTERNS) {
    if (patterns.some((p) => lower.includes(p))) {
      return role;
    }
  }
  return "data analyst"; // fallback
}

function formatCompanyName(slug: string): string {
  if (!slug) return "Unknown";
  // Workday sometimes uses things like Company_Careers or similar
  let clean = slug.replace(/_Careers/ig, "");
  return clean
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function parseCompanyFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname;

    const platform = ATS_PLATFORMS.find((p) => host.includes(p.domain));
    const atsDomain = platform ? platform.domain : "Unknown";

    // Check for subdomain-based platforms (e.g. careers-acme.icims.com or acme.bamboohr.com)
    if (host !== atsDomain && host.endsWith(atsDomain)) {
      const sub = host.replace("." + atsDomain, "").replace(/^careers-/, "");
      if (sub && sub !== "www") {
        return formatCompanyName(sub);
      }
    }

    // Path-based platforms (e.g. boards.greenhouse.io/acme or jobs.lever.co/acme)
    const segments = urlObj.pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      let slug = segments[0];
      // Hande locale prefixes for Workday like /en-US/acme
      if (slug.match(/^[a-z]{2}-[A-Z]{2}$/) && segments.length > 1) {
        slug = segments[1];
      }
      return formatCompanyName(slug);
    }
  } catch {
    // ignore
  }
  return "Unknown Company";
}

export function stableIdFromUrl(url: string): string {
  // Deterministic numeric hash of the URL → always the same ID for the same listing
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 32-bit int
  }
  return `job_${Math.abs(hash).toString(36)}`;
}

export function parseJobsFromSerper(
  results: SerperOrganicResult[],
  existingIds: Set<string>
): Job[] {
  const jobs: Job[] = [];
  const now = new Date().toISOString();

  results.forEach((result) => {
    if (!result.link) return;

    const searchText = `${result.title || ""} ${result.snippet || ""}`.toLowerCase();
    if (
      searchText.includes("hybrid") ||
      searchText.includes("in-office") ||
      searchText.includes("in office") ||
      searchText.includes("on-site") ||
      searchText.includes("on site") ||
      searchText.includes("in-person") ||
      searchText.includes("in person")
    ) {
      return; 
    }

    const platform = ATS_PLATFORMS.find((p) => result.link.includes(p.domain));
    if (!platform) return; // Drop unrecognized domains
    
    const atsDomain = platform.domain;
    const atsName = platform.name;

    const id = stableIdFromUrl(result.link);
    if (existingIds.has(id)) return;
    existingIds.add(id);

    const company = parseCompanyFromUrl(result.link);
    const role_type = detectRoleType(result.title || "");

    let date_posted: string | null = null;
    if (result.date) {
      date_posted = result.date;
    } else if (result.snippet) {
      const dateMatch = result.snippet.match(
        /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/
      );
      if (dateMatch) date_posted = dateMatch[0];
    }

    jobs.push({
      id,
      title: result.title || "Untitled",
      company,
      url: result.link,
      role_type,
      date_posted,
      fetchedAt: now,
      atsName,
    });
  });

  return jobs;
}


export interface SerperOrganicResult {
  title: string;
  link: string;
  snippet?: string;
  date?: string;
  position?: number;
}
