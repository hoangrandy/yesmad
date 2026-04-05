const fs = require("fs");

const envVars = fs.readFileSync(".env.local", "utf8");
const match = envVars.match(/SERPER_API_KEY=(.*)/);
const apiKey = match[1].trim();

async function testSerper(num) {
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: 'site:boards.greenhouse.io "data analyst" remote',
        num: num, // This is the issue
        gl: "us",
        hl: "en",
      }),
    });
    console.log(`num: ${num} -> HTTP ${response.status}`);
    const text = await response.text();
    console.log(text.substring(0, 100) + "...");
  } catch (err) {
    console.error(err);
  }
}

async function testSerperPage(page) {
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: 'site:boards.greenhouse.io "data analyst" remote',
        page: page, // Using page instead of num
        gl: "us",
        hl: "en",
      }),
    });
    console.log(`page: ${page} -> HTTP ${response.status}`);
    const text = await response.text();
    console.log(text.substring(0, 80) + "...");
  } catch (err) {
    console.error(err);
  }
}

async function main() {
  await testSerper(100);
  await testSerper(50);
  await testSerper(20);
  await testSerper(10);
  console.log("Testing pagination instead:");
  await testSerperPage(2);
  await testSerperPage(3);
}

main();
