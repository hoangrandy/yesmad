const fs = require("fs");

const envVars = fs.readFileSync(".env.local", "utf8");
const match = envVars.match(/SERPER_API_KEY=(.*)/);
const apiKey = match[1].trim();

const ATS_DOMAINS = [
  "boards.greenhouse.io",
  "jobs.lever.co",
  "jobs.smartrecruiters.com",
  "wd1.myworkdayjobs.com",
  "careers.icims.com",
  "jobs.bamboohr.com",
  "apply.jazz.co"
];
const ROLES = ["data analyst", "technical program manager", "business analyst", "data engineer"];

async function testParallel() {
  const queries = [];
  for (const domain of ATS_DOMAINS) {
    for (const role of ROLES) {
      queries.push(fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ q: `site:${domain} "${role}" remote`, num: 20, page: 1, gl: "us", hl: "en" })
      }).then(r => r.status));
    }
  }
  console.log(`Firing ${queries.length} requests...`);
  const results = await Promise.all(queries);
  console.log("Results:");
  console.log(results);
}
testParallel();
