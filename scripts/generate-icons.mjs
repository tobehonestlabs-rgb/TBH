/**
 * Generates PWA icon PNGs from the TBH SVG logo.
 * Run once: node scripts/generate-icons.mjs
 * Requires: npm install -D sharp (already common in Next.js projects)
 */
import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svgPath = join(root, 'public/assets/TBH_Simple_Logo.svg')
const outDir = join(root, 'public/icons')

mkdirSync(outDir, { recursive: true })

const svgBuffer = readFileSync(svgPath)

const sizes = [
  { file: 'icon-192.png',          size: 192, bg: '#FFFFFF', padding: 20 },
  { file: 'icon-512.png',          size: 512, bg: '#FFFFFF', padding: 50 },
  { file: 'icon-maskable-512.png', size: 512, bg: '#0D0D0D', padding: 100 },
  { file: 'apple-icon-180.png',    size: 180, bg: '#FFFFFF', padding: 20 },
]

for (const { file, size, bg, padding } of sizes) {
  const iconSize = size - padding * 2
  const resized = await sharp(svgBuffer)
    .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  await sharp({
    create: { width: size, height: size, channels: 4, background: bg },
  })
    .composite([{ input: resized, gravity: 'center' }])
    .png()
    .toFile(join(outDir, file))

  console.log(`✓ ${file}`)
}

console.log('\nAll icons generated in public/icons/')
