import { afterAll, describe, expect, test } from "bun:test"
import { getScreenshotTestEntries, getScreenshotTestExpectedPath, goto, initEnv, exit } from "./common"
import pixelmatch from "pixelmatch"
import { PNG } from 'pngjs';
import { tmpdir } from 'os';


const { context, proc } = await initEnv()
const entries = await getScreenshotTestEntries()

afterAll(async () => {
  console.log("killing process...")
  console.time("kill server")
  proc.kill("SIGKILL")
  await proc.exited; // resolves when process exit
  console.timeEnd("kill server")
})

function totalSAD(bufA: ArrayBufferLike, bufB: ArrayBufferLike) {
  if (bufA.byteLength !== bufB.byteLength) throw new Error("size mismatch");
  const a = new Uint8Array(bufA);
  const b = new Uint8Array(bufB);
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff += Math.abs(a[i] - b[i]);
  }
  return diff;           // lower == more similar
}

describe("Screenshot tests", () => {
  for (const entry of entries) {

    test(`Regression test for ${entry}`, async () => {
      const page = await context.newPage();

      console.log("entry :: ", entry)
      await goto(page, `/tests/${entry}`)

      const path = `${tmpdir()}/screenshot-test-${entry}.png`
      const image = await page.screenshot({
        scale: "css",
        fullPage: true,
        path
      })
      console.log("wrote current screenshot at", path)

      const expectedImage = await Bun.file(getScreenshotTestExpectedPath(entry)).arrayBuffer();
      // expect(image.byteLength, `'${entry}' snapshots should have the same length`).toBe(expectedImage.byteLength)

      // const sad = totalSAD(image.buffer, expectedImage)
      // expect(sad, "snapshots should be the same").toBeLessThan(1);
      // expect(sad, `'${entry}' snapshots be the same`).toBe(expectedImage.byteLength)
      const a = PNG.sync.read(Buffer.from(image));
      const b = PNG.sync.read(Buffer.from(expectedImage));
      const value = pixelmatch(a.data, b.data, null, 1920, 1080, { threshold: 0.1 })
      console.log(`pixelmatch value for ${entry} is ${value}`)
      // expected
      expect(value, `'${entry}' snapshots should identical`).toBeLessThan(50)

      await page.close();
    })
  }
})
