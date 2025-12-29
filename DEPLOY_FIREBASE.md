# Hướng dẫn Deploy lên Firebase Hosting

## ✅ Đã được tích hợp sẵn!

Project đã được cấu hình sẵn cho Firebase Hosting. Bạn chỉ cần làm theo các bước sau:

## Bước 1: Cài đặt Firebase CLI (nếu chưa có)

```bash
npm install -g firebase-tools
```

## Bước 2: Đăng nhập Firebase

```bash
firebase login
```

Lần đầu tiên sẽ mở trình duyệt để đăng nhập.

## Bước 3: Kiểm tra Project ID

File `.firebaserc` đã được tạo với project ID: `my-social-9bc6a`

Nếu project ID khác, bạn có thể sửa file `.firebaserc` hoặc chạy:
```bash
firebase use my-social-9bc6a
```

## Bước 4: Deploy (Cách 1 - Nhanh nhất)

Sử dụng script đã được thêm vào `package.json`:

```bash
npm run deploy
```

Lệnh này sẽ tự động:
1. Build project (`npm run build`)
2. Deploy lên Firebase Hosting (`firebase deploy --only hosting`)

## Bước 5: Deploy (Cách 2 - Từng bước)

Nếu muốn build và deploy riêng:

```bash
# Build project
npm run build

# Deploy lên Firebase Hosting
npm run deploy:hosting
```

hoặc:

```bash
npm run build
firebase deploy --only hosting
```

## Bước 6: Tự động hóa với GitHub Actions (Đã được setup sẵn!)

File `.github/workflows/firebase-deploy.yml` đã được tạo sẵn.

### Cách setup GitHub Actions:

1. **Tạo Firebase Service Account:**
   - Vào [Firebase Console](https://console.firebase.google.com/)
   - Chọn project `my-social-9bc6a`
   - Vào **Project Settings** > **Service accounts**
   - Click **Generate new private key**
   - Lưu file JSON được tải về

2. **Thêm Secrets vào GitHub:**
   - Vào repository trên GitHub
   - Vào **Settings** > **Secrets and variables** > **Actions**
   - Thêm các secrets sau:
     - `FIREBASE_SERVICE_ACCOUNT`: Copy toàn bộ nội dung file JSON vừa tải
     - `VITE_FIREBASE_API_KEY`: API key từ file `.env`
     - `VITE_FIREBASE_AUTH_DOMAIN`: Auth domain từ file `.env`
     - `VITE_FIREBASE_PROJECT_ID`: Project ID từ file `.env`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`: Messaging sender ID từ file `.env`
     - `VITE_FIREBASE_APP_ID`: App ID từ file `.env`
     - `VITE_FIREBASE_MEASUREMENT_ID`: Measurement ID từ file `.env`
     - `VITE_CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name từ file `.env`
     - `VITE_CLOUDINARY_UPLOAD_PRESET`: Cloudinary upload preset từ file `.env`

3. **Tự động deploy:**
   - Mỗi khi push code lên branch `main` hoặc `master`
   - GitHub Actions sẽ tự động build và deploy lên Firebase Hosting

### Deploy thủ công từ GitHub Actions:

Vào tab **Actions** trên GitHub, chọn workflow và chạy thủ công nếu cần.

## Lợi ích

- ✅ Tích hợp hoàn hảo với Firebase (Auth, Firestore)
- ✅ CDN toàn cầu của Google - tốc độ nhanh
- ✅ SSL tự động
- ✅ Custom domains miễn phí
- ✅ Preview channels cho testing
- ✅ Miễn phí 10GB storage, 360MB/day transfer

## URL sau khi deploy

Sau khi deploy thành công, bạn sẽ có URL:
- **Production**: `https://my-social-9bc6a.web.app`
- **Custom domain**: Có thể thêm trong Firebase Console > Hosting

## Lệnh hữu ích

```bash
# Xem danh sách các deployment
firebase hosting:channel:list

# Tạo preview channel
firebase hosting:channel:deploy preview-branch

# Xem logs
firebase hosting:clone my-social-9bc6a

# Xóa cache
firebase hosting:channel:delete preview-branch
```

## Troubleshooting

### Lỗi: "Firebase project not found"
- Kiểm tra project ID trong `.firebaserc`
- Chạy `firebase use my-social-9bc6a`

### Lỗi: "Permission denied"
- Chạy `firebase login` lại
- Kiểm tra quyền truy cập project trên Firebase Console

### Build fails
- Kiểm tra các environment variables đã được set đúng
- Chạy `npm run build` local để test trước

