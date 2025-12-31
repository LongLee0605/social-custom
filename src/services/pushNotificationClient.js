// Client-side service để gửi push notifications qua Vercel API
// Thay thế cho Cloud Functions

const PUSH_API_URL = import.meta.env.VITE_PUSH_API_URL || 'https://your-vercel-app.vercel.app/api/send-push'

/**
 * Gửi push notification qua Vercel API
 */
export const sendPushNotification = async ({ notification, tokens }) => {
  try {
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      console.log('No tokens to send push notification')
      return { success: false, error: 'No tokens provided' }
    }

    if (!notification) {
      return { success: false, error: 'Notification data required' }
    }

    const response = await fetch(PUSH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notification: {
          title: notification.title,
          body: notification.message || notification.body,
          type: notification.type,
          relatedUserId: notification.relatedUserId,
          relatedPostId: notification.relatedPostId,
          link: notification.link,
          notificationId: notification.notificationId,
        },
        tokens,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send push notification')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: error.message }
  }
}

