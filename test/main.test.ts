import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { readdir } from "node:fs/promises";

const port = 3000;

const proc = Bun.spawn(["bun", "preview", "--port", port.toString()], {
  stdout: "pipe"
});
const reader = proc.stdout.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  // if (done) throw new Error("Server did not start");
  const line = decoder.decode(value, { stream: true })
  console.log(line)
  if (done) break;
  if (line.includes("Local: ")) {
    console.log("Server started successfully");
    break;
  }
}


// wait for the server to start

console.log("Initialising tests..")

const browser = await chromium.launch({
  headless: false,
  devtools: true,
})
// Create context
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
});

const entries = await readdir("./test/screenshot-tests");
console.log("entreis : ", entries)


// Create initial page
const page = await context.newPage();
await page.goto(`http://localhost:${port}`, {
  waitUntil: "domcontentloaded"
})

for (const entry of entries) {
  console.log("entry :: ", entry)
  await page.goto(`http://localhost:${port}/tests/${entry}`, {
    waitUntil: "domcontentloaded"
  })

  await page.screenshot({
    scale: "css",
    path: `test/screenshot-tests/${entry}/expected.png`,
  })
}
// await new Promise(resolve => setTimeout(resolve, 5000)); // wait for the page to load

proc.kill();
