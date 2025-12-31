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

// Tạo SVG icon đẹp với gradient và design hiện đại
const createBeautifulIcon = (size) => {
  const padding = size * 0.15
  const innerSize = size - (padding * 2)
  const centerX = size / 2
  const centerY = size / 2
  const radius = innerSize * 0.4
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradient chính -->
    <linearGradient id="mainGrad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
    </linearGradient>
    
    <!-- Gradient phụ cho highlight -->
    <linearGradient id="highlightGrad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#818cf8;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#c084fc;stop-opacity:0.6" />
    </linearGradient>
    
    <!-- Shadow filter -->
    <filter id="shadow${size}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="0" dy="4" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.3"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- Glow effect -->
    <filter id="glow${size}">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background với rounded corners -->
  <rect width="${size}" height="${size}" rx="${size * 0.25}" ry="${size * 0.25}" fill="url(#mainGrad${size})" filter="url(#shadow${size})"/>
  
  <!-- Highlight overlay -->
  <ellipse cx="${centerX}" cy="${centerY * 0.6}" rx="${size * 0.5}" ry="${size * 0.2}" fill="url(#highlightGrad${size})" opacity="0.4"/>
  
  <!-- Main circle với gradient -->
  <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="${size * 0.02}"/>
  
  <!-- Letter S với style đẹp -->
  <text 
    x="${centerX}" 
    y="${centerY + size * 0.08}" 
    font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" 
    font-size="${size * 0.5}" 
    font-weight="700" 
    fill="white" 
    text-anchor="middle" 
    dominant-baseline="central"
    letter-spacing="-${size * 0.01}"
    filter="url(#glow${size})"
    style="text-shadow: 0 2px 4px rgba(0,0,0,0.2);"
  >S</text>
  
  <!-- Decorative dots -->
  <circle cx="${centerX - size * 0.15}" cy="${centerY - size * 0.15}" r="${size * 0.03}" fill="rgba(255,255,255,0.6)"/>
  <circle cx="${centerX + size * 0.15}" cy="${centerY + size * 0.15}" r="${size * 0.025}" fill="rgba(255,255,255,0.5)"/>
</svg>`
}

// Tạo favicon (16x16, 32x32)
const createFavicon = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="favGrad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#favGrad${size})"/>
  <text x="50%" y="50%" font-family="system-ui" font-size="${size * 0.6}" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="central">S</text>
</svg>`
}

// Tạo logo (cho header)
const createLogo = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
    </linearGradient>
    <filter id="logoShadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
      <feOffset dx="0" dy="2" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.3"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="40" height="40" rx="10" fill="url(#logoGrad)" filter="url(#logoShadow)"/>
  <text x="50%" y="50%" font-family="system-ui, -apple-system" font-size="24" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="central">S</text>
</svg>`
}

console.log('🎨 Generating beautiful PWA icons, logo and favicon...\n')

// Tạo tất cả PWA icons
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512]
iconSizes.forEach(size => {
  const svg = createBeautifulIcon(size)
  const svgPath = join(iconsDir, `icon-${size}x${size}.svg`)
  writeFileSync(svgPath, svg)
  console.log(`✅ Created: icon-${size}x${size}.svg`)
})

// Tạo favicon
const faviconSizes = [16, 32]
faviconSizes.forEach(size => {
  const svg = createFavicon(size)
  const svgPath = join(rootDir, 'public', `favicon-${size}x${size}.svg`)
  writeFileSync(svgPath, svg)
  console.log(`✅ Created: favicon-${size}x${size}.svg`)
})

// Tạo logo
const logo = createLogo()
const logoPath = join(rootDir, 'public', 'logo.svg')
writeFileSync(logoPath, logo)
console.log(`✅ Created: logo.svg`)

// Tạo favicon.ico (SVG version)
const favicon = createFavicon(32)
const faviconPath = join(rootDir, 'public', 'favicon.svg')
writeFileSync(faviconPath, favicon)
console.log(`✅ Created: favicon.svg`)

console.log('\n✨ All icons, logo and favicon generated successfully!')
console.log('\n📱 Icons are ready for PWA installation')
console.log('💡 Note: For best compatibility, consider converting SVG to PNG using:')
console.log('   - Online: https://cloudconvert.com/svg-to-png')
console.log('   - CLI: npm install -g svg2png-wasm')

