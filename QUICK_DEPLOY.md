# 🚀 Deploy Nhanh lên Firebase Hosting

## Cách nhanh nhất (3 bước)

### 1. Cài đặt Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Đăng nhập
```bash
firebase login
```

### 3. Deploy
```bash
npm run deploy
```

**Xong!** 🎉 Website của bạn sẽ có tại: `https://my-social-9bc6a.web.app`

---

## Chi tiết

### Lần đầu tiên deploy:
1. `npm install -g firebase-tools` - Cài Firebase CLI
2. `firebase login` - Đăng nhập (mở trình duyệt)
3. `npm run deploy` - Build và deploy

### Các lần deploy sau:
Chỉ cần chạy:
```bash
npm run deploy
```

### Scripts có sẵn:
- `npm run deploy` - Build + Deploy
- `npm run deploy:hosting` - Chỉ deploy (đã build sẵn)
- `npm run build` - Chỉ build

---

## Tự động deploy với GitHub

Sau khi setup GitHub Actions (xem `DEPLOY_FIREBASE.md`), mỗi lần push code lên `main` sẽ tự động deploy!

---

## Custom Domain

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project > **Hosting**
3. Click **Add custom domain**
4. Thêm domain của bạn
5. Thêm DNS records như hướng dẫn

---

## Hỗ trợ

Nếu gặp lỗi, xem file `DEPLOY_FIREBASE.md` để biết chi tiết troubleshooting.

