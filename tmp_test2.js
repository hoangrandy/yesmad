const fs = require("fs");

const envVars = fs.readFileSync(".env.local", "utf8");
const match = envVars.match(/SERPER_API_KEY=(.*)/);
const apiKey = match[1].trim();

async function testSerper() {
  try {
    const q = 'site:boards.greenhouse.io OR site:jobs.lever.co OR site:jobs.smartrecruiters.com "data analyst" remote';
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q,
        num: 20,
        page: 1,
        gl: "us",
        hl: "en",
      }),
    });
    console.log(`HTTP ${response.status}`);
    const data = await response.json();
    console.log(`Count: ${data.organic ? data.organic.length : 0}`);
  } catch (err) {
    console.error(err);
  }
}
testSerper();
