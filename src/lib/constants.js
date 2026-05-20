export const NOTIFICATION_TYPES = ['like', 'comment', 'follow', 'message', 'new_post']

export const FIRESTORE_IN_QUERY_LIMIT = 10

export const normalizeDisplayName = (name) =>
  (name || '').trim().toLowerCase()
