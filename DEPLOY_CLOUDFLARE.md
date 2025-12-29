# Hướng dẫn Deploy lên Cloudflare Pages

## Bước 1: Chuẩn bị

1. Đảm bảo code đã được push lên GitHub/GitLab
2. Đăng ký tài khoản miễn phí tại [Cloudflare](https://dash.cloudflare.com/sign-up)

## Bước 2: Tạo Project trên Cloudflare Pages

1. Truy cập [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Chọn **Pages** từ menu bên trái
3. Click **Create a project**
4. Chọn **Connect to Git** và kết nối repository của bạn

## Bước 3: Cấu hình Build Settings

- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (hoặc để trống)

## Bước 4: Environment Variables (nếu cần)

Thêm các biến môi trường trong **Settings > Environment variables**:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOUD_PRESET`

## Bước 5: Deploy

Cloudflare sẽ tự động deploy khi bạn push code lên Git.

## Lợi ích

- ✅ Tốc độ cực nhanh nhờ CDN toàn cầu
- ✅ Miễn phí không giới hạn bandwidth
- ✅ SSL tự động
- ✅ Preview deployments cho mỗi PR
- ✅ Custom domains miễn phí

