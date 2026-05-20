# Release gate

Chạy trước mỗi deploy production:

```bash
npm run lint
npm run test
npm run test:rules   # Cần Java + Firebase CLI
npm run build
```

Sau đó: [QA_CHECKLIST.md](./QA_CHECKLIST.md) trên staging.

Deploy rules/indexes trước client:

```bash
firebase deploy --only firestore:rules,firestore:indexes
npm run build
firebase deploy --only hosting
```

Migration tùy chọn (sau backup):

```bash
npm run backfill:search
npm run migrate:comments -- --dry-run
npm run migrate:comments
```
