import { exit, getScreenshotTestEntries, getScreenshotTestExpectedPath, getScreenshotTestExpectedPngPath, goto, initEnv } from "./common"

const { page, proc } = await initEnv()
const entries = await getScreenshotTestEntries()

for (const entry of entries) {
  console.log("entry :: ", entry)
  await goto(page, `/tests/${entry}`)

  const buffer = await page.screenshot({
    scale: "css",
  })

  // const path = `test/screenshot-tests/${entry}/expected`;
  await Bun.write(getScreenshotTestExpectedPath(entry), buffer)

  await page.screenshot({
    path: getScreenshotTestExpectedPngPath(entry),
  })
}

exit()
