import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getUser } from './usersRepository.js'

export async function createNotificationRecord({
  userId,
  actorId,
  type,
  title,
  message,
  link,
  relatedUserId,
  relatedPostId,
}) {
  let relatedUserName = null
  let relatedUserPhotoURL = null

  if (relatedUserId) {
    const related = await getUser(relatedUserId)
    if (related) {
      relatedUserName = related.displayName || 'Người dùng'
      relatedUserPhotoURL = related.photoURL || null
    }
  }

  return addDoc(collection(db, 'notifications'), {
    userId,
    actorId,
    type,
    title,
    message,
    link: link || null,
    relatedUserId: relatedUserId || null,
    relatedUserName,
    relatedUserPhotoURL,
    relatedPostId: relatedPostId || null,
    read: false,
    createdAt: serverTimestamp(),
  })
}
