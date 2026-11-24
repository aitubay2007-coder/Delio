import { contrast, deriveAccent, COLOR_SWATCHES } from "../src/lib/color.ts"

const backgrounds = ["#F6F5F2", "#F8F4EF", "#F4F0E8", "#F3F1EC", "#FFFDF8", "#100F0E"]
const samples = [...COLOR_SWATCHES.map((swatch) => swatch.hex), "#FFE566", "#777777", "#9A4D55"]
let failed = 0

for (const background of backgrounds) {
  for (const hex of samples) {
    const tokens = deriveAccent(hex, background)
    const button = contrast(tokens.buttonText, tokens.buttonBg)
    const text = contrast(tokens.text, background)
    if (button < 4.5 || text < 4.5) {
      failed += 1
      console.error("contrast fail", { hex, background, button, text, tokens })
    }
  }
}

if (failed) {
  console.error(`failed: ${failed}`)
  process.exit(1)
}

console.log(`contrast ok (${samples.length * backgrounds.length} pairs)`)
