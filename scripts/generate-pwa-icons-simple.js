import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const iconsDir = join(rootDir, 'public', 'icons')

// Đảm bảo thư mục icons tồn tại
mkdirSync(iconsDir, { recursive: true })

// Tạo SVG icon với design đẹp hơn và maskable
const createSVGIcon = (size) => {
  const padding = size * 0.1
  const innerSize = size - (padding * 2)
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#818cf8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow${size}">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
  </defs>
  <!-- Background với safe zone cho maskable -->
  <rect width="${size}" height="${size}" rx="${size * 0.25}" fill="url(#grad${size})" filter="url(#shadow${size})"/>
  <!-- Safe zone circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  <!-- Letter S -->
  <text x="50%" y="50%" font-family="system-ui, -apple-system, sans-serif" font-size="${size * 0.45}" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="central" letter-spacing="-2">S</text>
</svg>`
}

// Tạo tất cả các icon sizes
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512]

console.log('🎨 Generating improved PWA icons...\n')

iconSizes.forEach(size => {
  const svg = createSVGIcon(size)
  const svgPath = join(iconsDir, `icon-${size}x${size}.svg`)
  writeFileSync(svgPath, svg)
  console.log(`✅ Created: icon-${size}x${size}.svg`)
})

console.log('\n✨ All icons generated successfully!')
console.log('\n📱 These SVG icons work well for PWA.')
console.log('💡 For better compatibility, consider converting to PNG using:')
console.log('   - Online: https://cloudconvert.com/svg-to-png')
console.log('   - CLI: npm install -g svg2png-wasm')

