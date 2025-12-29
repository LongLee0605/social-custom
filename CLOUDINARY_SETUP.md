# Hướng dẫn cấu hình Cloudinary

Cloudinary là dịch vụ upload ảnh miễn phí, không cần cấu hình CORS, dễ sử dụng.

## Bước 1: Đăng ký tài khoản Cloudinary

1. Truy cập: https://cloudinary.com/
2. Click "Sign Up for Free"
3. Đăng ký bằng email hoặc Google

## Bước 2: Lấy thông tin cấu hình

1. Sau khi đăng nhập, vào **Dashboard**
2. Copy **Cloud Name** (ví dụ: `dxyz1234`)
3. Vào **Settings** > **Upload** > **Upload presets**
4. Click **Add upload preset**
5. Đặt tên preset (ví dụ: `social-custom`)
6. Chọn **Signing Mode**: `Unsigned` (để upload từ client)
7. Click **Save**
8. Copy tên preset vừa tạo

## Bước 3: Cấu hình trong project

1. Tạo file `.env` trong thư mục gốc (nếu chưa có)
2. Thêm các dòng sau:

```env
VITE_UPLOAD_SERVICE=cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

**Ví dụ:**
```env
VITE_UPLOAD_SERVICE=cloudinary
VITE_CLOUDINARY_CLOUD_NAME=dxyz1234
VITE_CLOUDINARY_UPLOAD_PRESET=social-custom
```

3. Restart dev server:
```bash
npm run dev
```

## Xong!

Bây giờ bạn có thể upload ảnh mà không cần cấu hình CORS hay Firebase Storage.

## Lưu ý

- Cloudinary miễn phí có giới hạn: 25GB storage, 25GB bandwidth/tháng
- Đủ cho hầu hết các dự án nhỏ và vừa
- Có thể nâng cấp lên gói trả phí nếu cần

