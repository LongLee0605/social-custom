# Cấu hình GitHub deploy Firebase Hosting

## Cảnh báo bảo mật

**Không gửi file JSON service account** qua chat, email, hoặc commit lên Git. Nếu private key đã lộ, hãy:

1. [Google Cloud Console](https://console.cloud.google.com/) → IAM → Service Accounts  
2. Chọn `firebase-adminsdk-...@my-social-9bc6a.iam.gserviceaccount.com`  
3. **Keys** → xóa key bị lộ → **Add key** → tạo key mới  
4. Cập nhật lại secret trên GitHub bằng file JSON mới  

---

## Cấu hình GitHub Environment (khuyên dùng)

### Bước 1 — Tạo environment

1. Repo GitHub → **Settings** → **Environments**
2. **New environment**
3. **Name:** `production` (đúng chữ thường, khớp workflow)
4. (Tùy chọn) **Deployment branches** → chỉ `main` / `master`
5. **Save protection rules**

### Bước 2 — Environment secrets (bắt buộc để deploy)

Vào environment **production** → **Environment secrets** → **Add secret**:

| Tên secret (Name) | Giá trị (Value) |
|-------------------|-----------------|
| **`FIREBASE_SERVICE_ACCOUNT`** | Dán **toàn bộ** nội dung file `.json` (một khối từ `{` đến `}`) |

Chỉ cần **một** secret này cho deploy Hosting. Workflow đọc đúng tên `FIREBASE_SERVICE_ACCOUNT`.

### Bước 3 — Environment variables (tùy chọn)

Không bắt buộc — app đã có config mặc định trong code. Chỉ thêm nếu muốn override:

| Tên variable | Ví dụ giá trị | Ghi chú |
|--------------|--------------|---------|
| `VITE_FIREBASE_PROJECT_ID` | `my-social-9bc6a` | Công khai |
| `VITE_CLOUDINARY_CLOUD_NAME` | tên cloudinary | Upload ảnh |

**Không** tách từng field JSON (`private_key`, `client_email`…) thành secret riêng — action Firebase cần **cả file JSON** trong `FIREBASE_SERVICE_ACCOUNT`.

### Bước 4 — Ý nghĩa các field trong file JSON (tham khảo)

| Field trong JSON | Dùng ở đâu |
|------------------|------------|
| `project_id` | `my-social-9bc6a` — khớp `.firebaserc` |
| `client_email` | Service account (không nhập riêng trên GitHub) |
| `private_key` | Nằm trong secret `FIREBASE_SERVICE_ACCOUNT` |
| `type` | Phải là `service_account` |

**Firebase Web Config** (apiKey, appId trong app) ≠ service account JSON.

### Bước 5 — Chạy deploy

Push lên `main` hoặc **Actions** → **Deploy to Firebase Hosting** → **Run workflow**.

Job **deploy-hosting** dùng `environment: production` → đọc secrets từ environment đó.

---

## Cách thay thế: Repository secrets

Nếu không dùng Environment:

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

- Name: `FIREBASE_SERVICE_ACCOUNT`  
- Value: toàn bộ JSON  

---

## Cách 2 — `FIREBASE_TOKEN`

```bash
npx firebase login:ci
```

Secret name: `FIREBASE_TOKEN` (trong environment **production** hoặc repository secrets).

---

## Deploy local

```bash
npm ci
npm run build
npx firebase login
npx firebase deploy --only hosting --project my-social-9bc6a
```

URL: https://my-social-9bc6a.web.app
