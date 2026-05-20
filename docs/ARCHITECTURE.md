# Architecture — social-custom

## Stack

- **Frontend:** React 18, Vite, Tailwind, React Router
- **Backend:** Firebase Auth, Firestore, Cloudinary (media)
- **Deploy:** Firebase Hosting, optional Cloudflare Pages

## Source layout

```
src/
├── app/              # App shell, routes, ErrorBoundary
├── pages/            # Route screens
├── features/         # (hooks/components grouped by domain via paths)
├── components/       # UI + feature components
├── contexts/         # AuthContext
├── hooks/            # Data subscriptions & actions
├── repositories/     # Firestore CRUD (no React)
├── services/         # Cloudinary, notifications orchestration
├── lib/
│   ├── firebase/     # App init, App Check optional
│   ├── validation/   # Shared client validation
│   └── constants.js
└── shared/           # Cross-cutting UI (ErrorBoundary)
```

## Data model

| Collection | Notes |
|------------|--------|
| `users` | Profile, `displayNameLower` for search, followers/following |
| `posts` | Feed; `comments` array (legacy) + `comments` subcollection |
| `chats` / `messages` | 1:1 chat |
| `notifications` | Requires `actorId == auth.uid` on create |

## Testing

- `npm run test` — Vitest unit tests
- `npm run test:rules` — Firestore rules (emulator)
- `docs/QA_CHECKLIST.md` — manual regression
