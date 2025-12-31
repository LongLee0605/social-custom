// Script để tạo placeholder icons cho PWA
// Chạy: node scripts/create-placeholder-icons.js
// Sau đó thay thế bằng icons thật của bạn

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const iconsDir = path.join(__dirname, '..', 'public', 'icons')

// Tạo thư mục nếu chưa có
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// Tạo file SVG placeholder đơn giản
const createSVGIcon = (size) => {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#6366f1" rx="${size * 0.2}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">SC</text>
</svg>`
}

console.log('Creating placeholder icons...')

sizes.forEach(size => {
  const svgContent = createSVGIcon(size)
  const filePath = path.join(iconsDir, `icon-${size}x${size}.svg`)
  fs.writeFileSync(filePath, svgContent)
  console.log(`✓ Created icon-${size}x${size}.svg`)
})

console.log('\n⚠️  LƯU Ý: Đây chỉ là placeholder icons (SVG).')
console.log('Bạn cần thay thế bằng PNG icons thật để PWA hoạt động tốt nhất.')
console.log('Xem hướng dẫn tại: public/icons/README.md')

