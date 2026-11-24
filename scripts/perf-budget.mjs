import { spawn } from "node:child_process"
import { setTimeout as delay } from "node:timers/promises"

const port = 43125
const url = `http://127.0.0.1:${port}`
const budgets = { performance: 70, accessibility: 90, "best-practices": 90 }

const server = spawn("npx", ["next", "start", "-p", String(port), "-H", "127.0.0.1"], {
  stdio: "ignore",
  detached: false,
})

async function ready() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // The server is still booting.
    }
    await delay(500)
  }
  throw new Error("The production server did not start")
}

try {
  await ready()
  const lighthouse = (await import("lighthouse")).default
  const chromeLauncher = await import("chrome-launcher")
  const { chromium } = await import("playwright-core")
  const chrome = await chromeLauncher.launch({
    chromePath: process.env.CHROME_PATH || chromium.executablePath(),
    chromeFlags: ["--headless", "--no-sandbox"],
  })
  const result = await lighthouse(url, {
    port: chrome.port,
    onlyCategories: Object.keys(budgets),
    formFactor: "mobile",
    screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2, disabled: false },
  })
  await chrome.kill()
  const scores = {}
  let failed = false
  for (const [name, minimum] of Object.entries(budgets)) {
    const score = Math.round((result.lhr.categories[name]?.score ?? 0) * 100)
    scores[name] = score
    if (score < minimum) failed = true
    console.log(`${name}: ${score} (budget ${minimum})`)
  }
  console.log(`LCP ${result.lhr.audits["largest-contentful-paint"]?.displayValue ?? "n/a"}`)
  console.log(`CLS ${result.lhr.audits["cumulative-layout-shift"]?.displayValue ?? "n/a"}`)
  if (failed) process.exitCode = 1
} finally {
  server.kill("SIGTERM")
}
