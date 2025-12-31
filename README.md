# Social Custom - Mạng xã hội

Ứng dụng mạng xã hội được xây dựng với React, TailwindCSS và Firebase.

## Tính năng

- ✅ Đăng nhập với Google
- ✅ Tạo và xem bài viết
- ✅ Upload ảnh và file
- ✅ Theo dõi/Hủy theo dõi người dùng
- ✅ Live chat real-time
- ✅ Trang cá nhân
- ✅ Cài đặt tài khoản
- ✅ Thông báo real-time (like, comment, follow, message, new post)
- ✅ Reactions cho tin nhắn
- ✅ **PWA (Progressive Web App)** - Cài đặt như ứng dụng mobile
- ✅ **Push Notifications** - Nhận thông báo trên điện thoại

## Công nghệ sử dụng

- **React 18** - UI Framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Firebase** - Backend (Authentication, Firestore, Storage)
- **React Router** - Routing
- **Lucide React** - Icons
- **Cloudinary** - Image upload service

## Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd social-custom
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` và thêm các biến sau:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Cloudinary Configuration (cho upload ảnh)
VITE_UPLOAD_SERVICE=cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Không cần environment variables đặc biệt cho PWA
```

### 4. Cấu hình Firebase

1. Tạo project mới trên [Firebase Console](https://console.firebase.google.com/)
2. Bật **Authentication** với **Google Provider**
3. Tạo **Firestore Database** (chế độ Production hoặc Test)
4. Cấu hình **Security Rules**:
   - Copy nội dung từ file `firestore.rules` trong source code
   - Paste vào Firebase Console > Firestore Database > Rules
   - Click **Publish**
5. (Tùy chọn) Tạo **Storage** cho upload file
6. Copy cấu hình Firebase vào file `.env`

### 5. Cấu hình Cloudinary (cho upload ảnh)

1. Đăng ký tài khoản miễn phí tại [Cloudinary](https://cloudinary.com/)
2. Lấy **Cloud Name** từ dashboard
3. Tạo **Upload Preset**:
   - Vào Settings > Upload > Upload presets
   - Click "Add upload preset"
   - Chọn "Unsigned" nếu muốn upload không cần authentication
   - Lưu preset name
4. Thêm thông tin vào file `.env`

### 6. Tạo Firestore Indexes (nếu cần)

Nếu gặp lỗi `failed-precondition`, cần tạo composite indexes:

1. Vào Firebase Console > Firestore Database > Indexes
2. Tạo các index sau:
   - Collection: `posts`, Fields: `userId` (Ascending), `createdAt` (Descending)
   - Collection: `notifications`, Fields: `userId` (Ascending), `createdAt` (Descending)

### 7. Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## Cấu trúc dự án

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── chat/           # Chat components
│   ├── layout/         # Layout components (Header, Sidebar)
│   ├── notifications/  # Notification components
│   ├── posts/          # Post components
│   ├── profile/        # Profile components
│   └── ui/             # Reusable UI components
├── contexts/           # React contexts (AuthContext)
├── hooks/              # Custom hooks
│   ├── useChats.js
│   ├── useMessages.js
│   ├── useNotifications.js
│   ├── usePosts.js
│   └── useUserProfile.js
├── pages/              # Page components
├── config/             # Configuration files
├── services/           # Service layers
│   ├── chatService.js
│   ├── imageUpload.js
│   └── notificationService.js
└── utils/              # Utility functions
```

## Tính năng chi tiết

### Chat
- Chat real-time với Firebase Firestore
- Gửi tin nhắn, ảnh, file
- Typing indicators
- Đánh dấu đã đọc
- Reactions cho tin nhắn (mỗi user chỉ có 1 reaction)

### Posts
- Tạo bài viết với text và ảnh
- Like và comment
- Xóa bài viết của mình
- Xóa comment của mình

### Profile
- Xem trang cá nhân
- Theo dõi/Hủy theo dõi
- Xem danh sách followers/following
- Chỉnh sửa profile

### Notifications
- Thông báo real-time cho:
  - Like bài viết
  - Comment bài viết
  - Follow
  - Tin nhắn mới

## Build cho production

```bash
npm run build
```

File build sẽ nằm trong thư mục `dist/`

## PWA (Progressive Web App)

### Tính năng PWA

Ứng dụng đã được cấu hình đầy đủ như PWA với các tính năng:
- **Manifest**: `public/manifest.json` - Cấu hình app metadata
- **Service Worker**: `public/sw.js` - Enhanced với offline support
- **Icons**: SVG icons tự động tạo (chạy `npm run generate:icons` để tạo lại)
- **Offline Support**: Cache assets và images để hoạt động offline
- **Fast Loading**: Cache-first strategy cho performance tốt hơn
- **Background Sync**: Tự động sync data khi có kết nối lại

### Tính năng PWA

Ứng dụng hỗ trợ đầy đủ PWA với các tính năng:

- **Cài đặt như app mobile**: Người dùng có thể cài đặt ứng dụng trên điện thoại/desktop
- **Offline support**: Service Worker cache các tài nguyên để hoạt động offline
- **Fast loading**: Cache-first strategy cho assets và images
- **Background sync**: Tự động sync data khi có kết nối lại
- **App-like experience**: Chạy như ứng dụng native, không có thanh địa chỉ trình duyệt

## Deploy lên Firebase

### 1. Đăng nhập Firebase CLI

```bash
npx firebase login
```

### 2. Deploy

Deploy toàn bộ (build + hosting + rules):

```bash
npm run build
firebase deploy
```

Hoặc deploy từng phần:

```bash
# Deploy Firestore Rules
firebase deploy --only firestore:rules

# Deploy Hosting
firebase deploy --only hosting
```

### 3. Sau khi deploy

- **PWA**: Mở app trên mobile, click menu > "Install app"
- **Push Notifications**: Cho phép notifications khi được hỏi
- **Test**: Gửi tin nhắn từ account khác để test push notifications

## Lưu ý quan trọng

### Security Rules
- **Bắt buộc**: Phải cấu hình Security Rules trong Firebase Console
- Copy nội dung từ `firestore.rules` và paste vào Firebase Console
- Rules đảm bảo:
  - Chỉ user đã đăng nhập mới có thể đọc/ghi
  - User chỉ có thể sửa profile của mình (trừ followers array)
  - Chỉ participant mới có thể xem tin nhắn
  - User chỉ có thể xem notifications của mình

### Firestore Indexes
- Indexes đã được định nghĩa trong `firestore.indexes.json`
- Deploy indexes: `firebase deploy --only firestore:indexes`
- Indexes đã được deploy tự động khi chạy `npm run deploy`

### PWA
- **Icons**: SVG icons đã được tạo tự động (chạy `npm run generate:icons` để tạo lại)
- **HTTPS**: PWA chỉ hoạt động trên HTTPS (hoặc localhost)
- **Browser Support**: Chrome/Edge có full support, Safari iOS có limited support
- **Offline Mode**: Service Worker cache assets và images để hoạt động offline
- **Install Prompt**: Tự động hiển thị prompt cài đặt khi có thể

## License

MIT
