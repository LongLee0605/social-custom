# Social Custom - Mạng xã hội

Một ứng dụng mạng xã hội được xây dựng với React, TailwindCSS và Firebase.

## Tính năng

- ✅ Đăng nhập với Google
- ✅ Tạo và xem bài viết
- ✅ Upload ảnh
- ✅ Theo dõi người dùng
- ✅ Live chat
- ✅ Trang cá nhân
- ✅ Cài đặt tài khoản

## Công nghệ sử dụng

- **React 18** - UI Framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Firebase** - Backend (Authentication, Firestore, Storage)
- **React Router** - Routing
- **Lucide React** - Icons

## Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd social-custom
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` từ `.env.example` và điền thông tin:
```bash
cp .env.example .env
```

**Cấu hình Upload Ảnh với Cloudinary:**
1. Đăng ký tài khoản miễn phí tại: https://cloudinary.com/
2. Lấy `Cloud Name` và tạo `Upload Preset` (Settings > Upload > Upload presets > Add upload preset)
3. Thêm vào file `.env`:
```
VITE_UPLOAD_SERVICE=cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

Xem hướng dẫn chi tiết: [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md)

4. Cấu hình Firebase:
   - Tạo project mới trên [Firebase Console](https://console.firebase.google.com/)
   - Bật Authentication với Google Provider
   - Tạo Firestore Database
   - **QUAN TRỌNG:** Cấu hình Security Rules (xem hướng dẫn bên dưới)
   - Copy cấu hình vào file `.env`

5. Chạy ứng dụng:
```bash
npm run dev
```

## Cấu trúc dự án

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── chat/           # Chat components
│   ├── layout/         # Layout components (Header, Sidebar)
│   ├── posts/          # Post components
│   └── ui/             # Reusable UI components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── pages/              # Page components
├── config/             # Configuration files
└── services/           # Service layers (nếu cần)
```

## ⚠️ Lỗi Permission Denied?

Nếu bạn gặp lỗi `Missing or insufficient permissions`, hãy:

1. Copy rules từ file trong source code:
   - `firestore.rules` → Firebase Console > Firestore Database > Rules
2. Click **Publish** sau khi paste

## Tính năng đang phát triển

- [ ] Chia sẻ bài viết
- [ ] Thông báo real-time
- [ ] Tìm kiếm người dùng
- [ ] Stories
- [ ] Video posts
- [ ] Responsive mobile app

## Tài liệu

- [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) - Hướng dẫn cấu hình Cloudinary

## 🔐 Security Rules trong Source Code

Rules đã được đồng bộ vào source code để dễ quản lý:

- `firestore.rules` - Firestore Security Rules

**Cách sử dụng**: Copy nội dung từ file này và paste vào Firebase Console > Firestore Database > Rules, sau đó click **Publish**.

## License

MIT