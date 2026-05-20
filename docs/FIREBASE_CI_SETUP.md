# Cấu hình GitHub Actions deploy Firebase Hosting

Lỗi `Input required and not supplied: firebaseServiceAccount` nghĩa là repo **chưa có** secret `FIREBASE_SERVICE_ACCOUNT`.

**Firebase Web Config** (`apiKey`, `projectId`, `appId`…) dùng trong app — **không** thay thế được service account.

---

## Cách 1 — `FIREBASE_SERVICE_ACCOUNT` (khuyên dùng)

### Bước 1: Tạo service account

1. Mở [Firebase Console](https://console.firebase.google.com/) → project **my-social-9bc6a**
2. **Project settings** (bánh răng) → tab **Service accounts**
3. **Generate new private key** → tải file `.json`

### Bước 2: Thêm secret trên GitHub

1. Repo GitHub → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. **Name:** `FIREBASE_SERVICE_ACCOUNT` (đúng tên, viết hoa)
4. **Secret:** mở file JSON vừa tải, **copy toàn bộ** (từ `{` đến `}`) và dán vào ô Secret
5. **Add secret**

### Bước 3: Chạy lại workflow

- Push một commit lên `main`, hoặc
- **Actions** → **Deploy to Firebase Hosting** → **Run workflow**

---

## Cách 2 — `FIREBASE_TOKEN` (thay thế)

Trên máy đã cài Firebase CLI và đăng nhập:

```bash
npx firebase login:ci
```

Copy token hiển thị → GitHub secret tên **`FIREBASE_TOKEN`**.

---

## Deploy thủ công (không cần GitHub secret)

```bash
npm ci
npm run build
npx firebase login
npx firebase deploy --only hosting --project my-social-9bc6a
```

URL sau deploy: https://my-social-9bc6a.web.app

---

## Kiểm tra secret đã đúng chưa

- Tên secret: `FIREBASE_SERVICE_ACCOUNT` (không có khoảng trắng, không đổi tên)
- Giá trị: JSON hợp lệ, có `"type": "service_account"`
- Service account cần quyền deploy Hosting (role **Firebase Hosting Admin** hoặc **Firebase Admin** trên Google Cloud IAM)
