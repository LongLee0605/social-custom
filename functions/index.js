// Cloud Functions để gửi Push Notifications qua FCM
// Cần cài đặt: npm install -g firebase-tools
// Sau đó: firebase init functions
// Và: npm install firebase-functions firebase-admin

const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

// Trigger khi có notification mới được tạo
exports.sendPushNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snapshot, context) => {
    const notification = snapshot.data()
    
    // Lấy FCM tokens của user
    const userTokensRef = admin.firestore().collection('userFCMTokens').doc(notification.userId)
    const userTokensDoc = await userTokensRef.get()
    
    if (!userTokensDoc.exists) {
      console.log(`No FCM tokens found for user ${notification.userId}`)
      return null
    }
    
    const tokens = userTokensDoc.data().tokens || []
    
    if (tokens.length === 0) {
      console.log(`No FCM tokens available for user ${notification.userId}`)
      return null
    }
    
    // Tạo message payload
    const message = {
      notification: {
        title: notification.title || 'Social Custom',
        body: notification.message || 'Bạn có thông báo mới',
      },
      data: {
        type: notification.type || '',
        relatedUserId: notification.relatedUserId || '',
        relatedPostId: notification.relatedPostId || '',
        link: notification.link || '/',
        notificationId: context.params.notificationId,
      },
      webpush: {
        notification: {
          title: notification.title || 'Social Custom',
          body: notification.message || 'Bạn có thông báo mới',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: notification.type || 'social-custom-notification',
          requireInteraction: false,
        },
        fcmOptions: {
          link: notification.link || '/',
        },
      },
      tokens: tokens,
    }
    
    try {
      // Gửi notification đến tất cả tokens
      const response = await admin.messaging().sendEachForMulticast(message)
      console.log(`Successfully sent ${response.successCount} notifications`)
      
      // Xóa invalid tokens
      if (response.failureCount > 0) {
        const failedTokens = []
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx])
          }
        })
        
        if (failedTokens.length > 0) {
          const validTokens = tokens.filter(token => !failedTokens.includes(token))
          await userTokensRef.update({
            tokens: validTokens,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          })
        }
      }
      
      return { success: true, successCount: response.successCount }
    } catch (error) {
      console.error('Error sending push notification:', error)
      return { success: false, error: error.message }
    }
  })

