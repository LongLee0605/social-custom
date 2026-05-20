import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { normalizeDisplayName } from '@/lib/constants'

export async function getUser(userId) {
  const snap = await getDoc(doc(db, 'users', userId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export function subscribeUser(userId, callback, onError) {
  return onSnapshot(
    doc(db, 'users', userId),
    (snap) => callback(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    onError
  )
}

export async function upsertUser(userId, data) {
  const payload = { ...data }
  if (payload.displayName) {
    payload.displayNameLower = normalizeDisplayName(payload.displayName)
  }
  return setDoc(doc(db, 'users', userId), payload, { merge: true })
}

export async function updateUser(userId, data) {
  const payload = { ...data }
  if (payload.displayName !== undefined) {
    payload.displayNameLower = normalizeDisplayName(payload.displayName)
  }
  return updateDoc(doc(db, 'users', userId), payload)
}

export async function searchUsersByPrefix(searchTerm, excludeUserId, maxResults = 5) {
  const term = normalizeDisplayName(searchTerm)
  if (!term) return []

  const q = query(
    collection(db, 'users'),
    where('displayNameLower', '>=', term),
    where('displayNameLower', '<=', term + '\uf8ff'),
    orderBy('displayNameLower'),
    limit(maxResults + 5)
  )
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((u) => u.uid && u.uid !== excludeUserId)
    .slice(0, maxResults)
}

export async function searchUsersFallback(searchTerm, excludeUserId, maxResults = 5) {
  const term = searchTerm.toLowerCase()
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter(
      (u) =>
        u.uid &&
        u.uid !== excludeUserId &&
        (u.displayName?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term) ||
          u.displayNameLower?.includes(term))
    )
    .slice(0, maxResults)
}
