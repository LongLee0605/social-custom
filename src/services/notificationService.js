import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore'
import { db } from '../config/firebase'

export const createNotification = async ({ userId, type, title, message, link, relatedUserId, relatedPostId }) => {
  try {
    if (!userId) return { success: false, error: 'Missing userId' }

    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' }
    }

    let relatedUserName = null
    let relatedUserPhotoURL = null

    if (relatedUserId) {
      try {
        const relatedUserDoc = await getDoc(doc(db, 'users', relatedUserId))
        if (relatedUserDoc.exists()) {
          const relatedUserData = relatedUserDoc.data()
          relatedUserName = relatedUserData.displayName || 'Người dùng'
          relatedUserPhotoURL = relatedUserData.photoURL || null
        }
      } catch (error) {
        console.error('Error fetching related user:', error)
      }
    }

    const notificationData = {
      userId,
      type,
      title,
      message,
      link: link || null,
      relatedUserId: relatedUserId || null,
      relatedUserName: relatedUserName || null,
      relatedUserPhotoURL: relatedUserPhotoURL || null,
      relatedPostId: relatedPostId || null,
      read: false,
      createdAt: serverTimestamp(),
    }

    await addDoc(collection(db, 'notifications'), notificationData)

    return { success: true }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { success: false, error: error.message }
  }
}

