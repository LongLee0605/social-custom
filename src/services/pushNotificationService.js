import { messaging } from '../config/firebase'
import { getToken, onMessage } from 'firebase/messaging'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || ''

/**
 * Yêu cầu quyền thông báo từ người dùng
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return 'not-supported'
  }

  const permission = await Notification.requestPermission()
  return permission
}

/**
 * Lấy FCM token và lưu vào Firestore
 */
export const getFCMToken = async () => {
  if (!messaging) {
    console.log('Firebase Cloud Messaging is not available')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    })

    if (token) {
      console.log('FCM Token:', token)
      await saveTokenToFirestore(token)
      return token
    } else {
      console.log('No registration token available. Request permission to generate one.')
      return null
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error)
    return null
  }
}

/**
 * Lưu FCM token vào Firestore
 */
export const saveTokenToFirestore = async (token) => {
  try {
    const auth = (await import('../config/firebase')).auth
    const { getAuth } = await import('firebase/auth')
    const currentUser = getAuth().currentUser

    if (!currentUser) {
      console.log('No user logged in')
      return
    }

    const userTokensRef = doc(db, 'userFCMTokens', currentUser.uid)
    const userTokensDoc = await getDoc(userTokensRef)

    if (userTokensDoc.exists()) {
      const existingTokens = userTokensDoc.data().tokens || []
      if (!existingTokens.includes(token)) {
        await updateDoc(userTokensRef, {
          tokens: [...existingTokens, token],
          updatedAt: serverTimestamp()
        })
      }
    } else {
      await setDoc(userTokensRef, {
        tokens: [token],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
  } catch (error) {
    console.error('Error saving token to Firestore:', error)
  }
}

/**
 * Xóa FCM token khỏi Firestore
 */
export const deleteTokenFromFirestore = async (token) => {
  try {
    const { getAuth } = await import('firebase/auth')
    const currentUser = getAuth().currentUser

    if (!currentUser) {
      return
    }

    const userTokensRef = doc(db, 'userFCMTokens', currentUser.uid)
    const userTokensDoc = await getDoc(userTokensRef)

    if (userTokensDoc.exists()) {
      const existingTokens = userTokensDoc.data().tokens || []
      const updatedTokens = existingTokens.filter(t => t !== token)

      if (updatedTokens.length > 0) {
        await updateDoc(userTokensRef, {
          tokens: updatedTokens,
          updatedAt: serverTimestamp()
        })
      } else {
        await setDoc(userTokensRef, {
          tokens: updatedTokens,
          updatedAt: serverTimestamp()
        }, { merge: true })
      }
    }
  } catch (error) {
    console.error('Error deleting token from Firestore:', error)
  }
}

/**
 * Lắng nghe tin nhắn khi app đang mở (foreground)
 */
export const onMessageListener = () => {
  return new Promise((resolve) => {
    if (!messaging) {
      resolve(null)
      return
    }

    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload)
      resolve(payload)
    })
  })
}

/**
 * Lấy tất cả FCM tokens của một user
 */
export const getUserFCMTokens = async (userId) => {
  try {
    const userTokensRef = doc(db, 'userFCMTokens', userId)
    const userTokensDoc = await getDoc(userTokensRef)

    if (userTokensDoc.exists()) {
      return userTokensDoc.data().tokens || []
    }
    return []
  } catch (error) {
    console.error('Error getting user FCM tokens:', error)
    return []
  }
}

