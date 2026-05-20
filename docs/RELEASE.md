# Release gate

Chạy trước mỗi deploy production:

```bash
npm run lint
npm run test
npm run test:rules   # Cần Java + Firebase CLI
npm run build
```

Sau đó: [QA_CHECKLIST.md](./QA_CHECKLIST.md) trên staging.

Deploy lên Firebase Hosting (local):

```bash
npm ci
npm run build
npx firebase login
npx firebase deploy --only firestore:rules,firestore:indexes
npx firebase deploy --only hosting
```

Hoặc một lệnh: `npm run deploy` (build + rules + indexes + hosting).

**GitHub Actions** (`firebase-deploy.yml`): Environment **`production`** + secret **`FIREBASE_SERVICE_ACCOUNT`** (full JSON). Hướng dẫn: [FIREBASE_CI_SETUP.md](./FIREBASE_CI_SETUP.md).

**Lưu ý:** `test:rules` cần Java trên máy local. Nếu chưa cài Java, vẫn deploy hosting được:

```bash
npm run build
npx firebase deploy --only hosting
```

Migration tùy chọn (sau backup):

```bash
npm run backfill:search
npm run migrate:comments -- --dry-run
npm run migrate:comments
```
