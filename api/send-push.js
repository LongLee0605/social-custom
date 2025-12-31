// Vercel Serverless Function để gửi Push Notifications
// Deploy lên Vercel (miễn phí) để thay thế Cloud Functions

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Chỉ cho phép POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { notification, tokens } = req.body

    if (!notification || !tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({ error: 'Missing notification or tokens' })
    }

    // Lấy FCM Server Key từ environment variable
    const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY
    if (!FCM_SERVER_KEY) {
      console.error('FCM_SERVER_KEY not configured')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    // Gửi push notification qua FCM REST API
    const fcmUrl = 'https://fcm.googleapis.com/fcm/send'
    
    // Gửi đến từng token (FCM free tier cho phép multicast)
    const results = await Promise.allSettled(
      tokens.map(async (token) => {
        const message = {
          to: token,
          notification: {
            title: notification.title || 'Social Custom',
            body: notification.body || notification.message || 'Bạn có thông báo mới',
            icon: notification.icon || '/icons/icon-192x192.png',
            badge: notification.badge || '/icons/icon-72x72.png',
          },
          data: {
            type: notification.type || '',
            relatedUserId: notification.relatedUserId || '',
            relatedPostId: notification.relatedPostId || '',
            link: notification.link || '/',
            notificationId: notification.notificationId || '',
          },
          webpush: {
            notification: {
              title: notification.title || 'Social Custom',
              body: notification.body || notification.message || 'Bạn có thông báo mới',
              icon: notification.icon || '/icons/icon-192x192.png',
              badge: notification.badge || '/icons/icon-72x72.png',
              tag: notification.type || 'social-custom-notification',
              requireInteraction: false,
            },
            fcmOptions: {
              link: notification.link || '/',
            },
          },
        }

        const response = await fetch(fcmUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${FCM_SERVER_KEY}`,
          },
          body: JSON.stringify(message),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`FCM error: ${response.status} - ${errorText}`)
        }

        const result = await response.json()
        return { token, success: result.success === 1, result }
      })
    )

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failedTokens = results
      .filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))
      .map(r => r.status === 'fulfilled' ? r.value.token : null)
      .filter(Boolean)

    return res.status(200).json({
      success: true,
      successCount,
      failedCount: failedTokens.length,
      failedTokens,
    })
  } catch (error) {
    console.error('Error sending push notification:', error)
    return res.status(500).json({ error: error.message })
  }
}

