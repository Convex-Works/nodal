import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { readdir } from "node:fs/promises";

const port = 3000;
let _proc: Bun.Subprocess | undefined;

export async function initEnv() {
  if (_proc) {
    throw new Error("Environment already initialized");
  }

  const proc = Bun.spawn(["bun", "preview", "--port", port.toString()], {
    stdout: "pipe"
  });
  _proc = proc;
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

  const browser = await chromium.launch({
    headless: true,
    devtools: false,
  })
  // Create context
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();
  return {
    browser,
    context,
    page,
    proc
  }
}

export async function goto(page: Page, endpoint: string) {
  return await page.goto(new URL(endpoint, `http://localhost:${port}`).href, {
    waitUntil: "domcontentloaded"
  })
}

export async function getScreenshotTestEntries() {
  return (await readdir("./test/screenshot-tests")).filter(f => {
    return f != ".DS_Store"
  });
}
export function getScreenshotTestExpectedPath(entry: string) {
  return `test/screenshot-tests/${entry}/expected`;
}

export function getScreenshotTestExpectedPngPath(entry: string) {
  return `test/screenshot-tests/${entry}/expected.png`;
}

export function exit() {
  console.log('exiting...')
  _proc?.kill(0);
  process.exit()
}
