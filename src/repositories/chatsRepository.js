import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function findOrCreateChat(userId1, userId2) {
  const chatsRef = collection(db, 'chats')
  const q = query(chatsRef, where('participants', 'array-contains', userId1))
  const snapshot = await getDocs(q)
  const existing = snapshot.docs.find((d) => {
    const data = d.data()
    return data.participants.includes(userId2) && data.participants.length === 2
  })

  if (existing) {
    return { success: true, chatId: existing.id }
  }

  const ref = await addDoc(chatsRef, {
    participants: [userId1, userId2],
    lastMessage: '',
    unreadCount: { [userId1]: 0, [userId2]: 0 },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return { success: true, chatId: ref.id }
}
