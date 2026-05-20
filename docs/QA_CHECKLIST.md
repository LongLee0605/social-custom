# QA Checklist — social-custom

Chạy sau mỗi phase refactor. Môi trường: staging Firebase + `npm run dev`.

## Auth

- [ ] Đăng nhập Google thành công
- [ ] Đăng xuất, quay lại `/login`
- [ ] Protected routes chặn khi chưa đăng nhập
- [ ] Profile tạo đúng trên Firestore lần đầu

## Feed & Posts

- [ ] Tab **Tất cả** hiển thị bài mới nhất
- [ ] Tab **Đang theo dõi** chỉ hiện bài từ người follow + bản thân
- [ ] Tạo bài (text), tạo bài (ảnh), validation lỗi hiển thị
- [ ] Like / unlike
- [ ] Comment, reply 3 cấp, reaction comment
- [ ] Xóa comment (owner), xóa bài (owner)

## Profile

- [ ] Xem profile người khác
- [ ] Follow / unfollow
- [ ] Modal followers / following

## Chat

- [ ] Tạo chat mới từ search
- [ ] Gửi text, emoji
- [ ] Gửi ảnh, file (extension hợp lệ)
- [ ] Typing indicator, unread count
- [ ] Deep link `?userId=`

## Notifications

- [ ] Toast khi like/comment/follow/message/new_post
- [ ] Dropdown đánh dấu đã đọc
- [ ] Link điều hướng đúng

## Settings

- [ ] Đổi display name, bio
- [ ] Upload avatar (validation size/type)

## PWA

- [ ] Service worker đăng ký (DevTools → Application)
- [ ] Install prompt (nếu supported)

## Automated (trước deploy)

```bash
npm run lint
npm run test
npm run test:rules
npm run build
```
