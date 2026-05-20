# GitHub Actions → Firebase (build & deploy)

Workflow: `.github/workflows/firebase-deploy.yml`

| Job | Mô tả |
|-----|--------|
| **build-and-test** | `npm ci` → lint → test → test:rules → build → upload `dist` |
| **deploy-firebase** | Dùng environment **`production`** → deploy rules + hosting |

---

## Bước 1 — Tạo Environment trên GitHub

1. Repo → **Settings** → **Environments**
2. **New environment** → tên: **`production`** (viết thường, đúng như workflow)
3. (Khuyên dùng) **Deployment branches** → chỉ `main` hoặc `master`
4. Save

---

## Bước 2 — Thêm Environment secret (bắt buộc)

Vào **Environments** → **production** → **Environment secrets** → **Add secret**

| Name | Value |
|------|--------|
| **`FIREBASE_SERVICE_ACCOUNT`** | Toàn bộ nội dung file JSON service account (một khối từ `{` đến `}`) |

Lấy file JSON:

1. [Firebase Console](https://console.firebase.google.com/) → **my-social-9bc6a**
2. **Project settings** → **Service accounts**
3. **Generate new private key**

**Không** tách `private_key`, `client_email`… thành secret riêng.

**Không** dùng Firebase Web Config (`apiKey`, `appId`) thay cho JSON này.

### Quyền service account (Google Cloud IAM)

Account `firebase-adminsdk-...@my-social-9bc6a.iam.gserviceaccount.com` cần một trong:

- **Firebase Admin**
- hoặc **Firebase Hosting Admin** + quyền deploy Firestore rules

---

## Bước 3 — Secrets tùy chọn (upload ảnh)

Nếu dùng Cloudinary, thêm **Environment secrets** hoặc **Repository secrets**:

| Name | Mô tả |
|------|--------|
| `VITE_CLOUDINARY_CLOUD_NAME` | Tên cloud Cloudinary |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Upload preset |

Không có vẫn build được; chỉ upload ảnh/file có thể lỗi.

---

## Bước 4 — Chạy pipeline

- **Push** lên `main` / `master`, hoặc
- **Actions** → **Deploy to Firebase Hosting** → **Run workflow**

Khi thành công:

- https://my-social-9bc6a.web.app
- https://my-social-9bc6a.firebaseapp.com

---

## Cách dự phòng: Repository secret

Nếu không dùng Environment, thêm cùng tên tại:

**Settings** → **Secrets and variables** → **Actions** → `FIREBASE_SERVICE_ACCOUNT`

Job `deploy-firebase` vẫn dùng `environment: production` — secret trên environment được ưu tiên; có thể thêm secret trùng tên ở repository level nếu GitHub merge theo docs.

---

## Lỗi thường gặp

| Lỗi | Cách xử lý |
|-----|------------|
| `firebaseServiceAccount` / auth failed | Chưa có `FIREBASE_SERVICE_ACCOUNT` trong environment **production** |
| `Could not spawn java` (local) | Cài Java 17+ cho `npm run test:rules` |
| `rollup-linux-x64-gnu` | Chạy `npm ci --include=optional` |
| Deploy OK nhưng app trắng | Kiểm tra `dist/index.html` tồn tại sau build |

---

## Deploy thủ công (local)

```bash
npm ci --include=optional
npm run build
npx firebase login
npx firebase deploy --only firestore:rules,firestore:indexes --project my-social-9bc6a
npx firebase deploy --only hosting --project my-social-9bc6a
```

---

## Bảo mật

- Không commit file JSON service account
- Không gửi private key qua chat / issue
- Key lộ → xóa key cũ trên Google Cloud → tạo key mới → cập nhật GitHub secret
