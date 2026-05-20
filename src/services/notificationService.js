import { getAuth } from 'firebase/auth'
import { createNotificationRecord } from '@/repositories/notificationsRepository'
import { NOTIFICATION_TYPES } from '@/lib/constants'

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  link,
  relatedUserId,
  relatedPostId,
}) => {
  try {
    if (!userId) return { success: false, error: 'Missing userId' }
    if (!NOTIFICATION_TYPES.includes(type)) {
      return { success: false, error: 'Invalid notification type' }
    }

    const auth = getAuth()
    const currentUser = auth.currentUser
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' }
    }
    if (userId === currentUser.uid) {
      return { success: false, error: 'Cannot create notification for yourself' }
    }

    await createNotificationRecord({
      userId,
      actorId: currentUser.uid,
      type,
      title,
      message,
      link,
      relatedUserId: relatedUserId || currentUser.uid,
      relatedPostId,
    })

    return { success: true }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { success: false, error: error.message }
  }
}
