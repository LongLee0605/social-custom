import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../config/firebase'
import { sendPushNotification } from './pushNotificationClient'
import { getUserFCMTokens } from './pushNotificationService'

export const createNotification = async ({ userId, type, title, message, link, relatedUserId, relatedPostId }) => {
  try {
    if (!userId) return { success: false, error: 'Missing userId' }

    // Không tạo thông báo cho chính mình
    const auth = getAuth()
    const currentUser = auth.currentUser
    if (currentUser && userId === currentUser.uid) {
      return { success: false, error: 'Cannot create notification for yourself' }
    }

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

    const notificationRef = await addDoc(collection(db, 'notifications'), notificationData)

    // Gửi push notification qua Vercel API (thay thế Cloud Functions)
    try {
      const tokens = await getUserFCMTokens(userId)
      if (tokens && tokens.length > 0) {
        await sendPushNotification({
          notification: {
            ...notificationData,
            notificationId: notificationRef.id,
          },
          tokens,
        }).catch((error) => {
          console.error('Error sending push notification:', error)
          // Không fail nếu push notification lỗi
        })
      }
    } catch (pushError) {
      console.error('Error in push notification flow:', pushError)
      // Không fail nếu push notification lỗi
    }

    return { success: true }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { success: false, error: error.message }
  }
}

