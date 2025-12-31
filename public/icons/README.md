# PWA Icons

Thư mục này chứa các icon cho Progressive Web App.

## Yêu cầu

Bạn cần tạo các icon với kích thước sau:

- `icon-72x72.png` (72x72px)
- `icon-96x96.png` (96x96px)
- `icon-128x128.png` (128x128px)
- `icon-144x144.png` (144x144px)
- `icon-152x152.png` (152x152px)
- `icon-192x192.png` (192x192px) - **QUAN TRỌNG**
- `icon-384x384.png` (384x384px)
- `icon-512x512.png` (512x512px) - **QUAN TRỌNG**

## Cách tạo icons

### Phương pháp 1: Sử dụng tool online

1. Tạo một icon 512x512px với logo của bạn
2. Truy cập: https://realfavicongenerator.net/ hoặc https://www.pwabuilder.com/imageGenerator
3. Upload icon 512x512px
4. Download và đặt vào thư mục này

### Phương pháp 2: Sử dụng PWA Asset Generator

```bash
npm install -g pwa-asset-generator
pwa-asset-generator your-logo.png public/icons --icon-only
```

### Phương pháp 3: Tạo thủ công

1. Tạo icon 512x512px với logo của bạn
2. Resize thành các kích thước trên bằng Photoshop/GIMP/ImageMagick
3. Đặt tên file theo format: `icon-{size}x{size}.png`

## Lưu ý

- Icon nên có nền trong suốt hoặc nền đẹp
- Icon nên dễ nhận biết ở kích thước nhỏ
- Format: PNG với transparency support
- Tất cả icons phải có cùng design

## Test

Sau khi tạo icons, kiểm tra:
1. Build app: `npm run build`
2. Mở `dist/manifest.json` và kiểm tra paths
3. Mở DevTools > Application > Manifest và kiểm tra icons

