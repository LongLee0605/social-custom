import { getToken, onMessage } from 'firebase/messaging'
import { messaging } from '../config/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { getAuth } from 'firebase/auth'

// VAPID key - Cần thay bằng key từ Firebase Console
// Lấy từ: Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || ''

/**
 * Đăng ký service worker và lấy FCM token
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return null
  }

  if (Notification.permission === 'granted') {
    return await getFCMToken()
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      return await getFCMToken()
    }
  }

  return null
}

/**
 * Lấy FCM token
 */
export const getFCMToken = async () => {
  if (!messaging) {
    console.log('Firebase Cloud Messaging is not available')
    return null
  }

  try {
    // Đăng ký service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })

    // Lấy FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    })

    if (token) {
      console.log('FCM Token:', token)
      // Lưu token vào Firestore
      await saveTokenToFirestore(token)
      return token
    } else {
      console.log('No registration token available')
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
const saveTokenToFirestore = async (token) => {
  const auth = getAuth()
  const user = auth.currentUser

  if (!user) {
    console.log('User not logged in, cannot save token')
    return
  }

  try {
    const userTokensRef = doc(db, 'userFCMTokens', user.uid)
    const userTokensDoc = await getDoc(userTokensRef)

    if (userTokensDoc.exists()) {
      const tokens = userTokensDoc.data().tokens || []
      if (!tokens.includes(token)) {
        await setDoc(userTokensRef, {
          tokens: [...tokens, token],
          updatedAt: new Date().toISOString()
        }, { merge: true })
      }
    } else {
      await setDoc(userTokensRef, {
        tokens: [token],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
  const auth = getAuth()
  const user = auth.currentUser

  if (!user) {
    return
  }

  try {
    const userTokensRef = doc(db, 'userFCMTokens', user.uid)
    const userTokensDoc = await getDoc(userTokensRef)

    if (userTokensDoc.exists()) {
      const tokens = userTokensDoc.data().tokens || []
      const updatedTokens = tokens.filter(t => t !== token)

      if (updatedTokens.length === 0) {
        // Xóa document nếu không còn token nào
        await setDoc(userTokensRef, {
          tokens: [],
          updatedAt: new Date().toISOString()
        }, { merge: true })
      } else {
        await setDoc(userTokensRef, {
          tokens: updatedTokens,
          updatedAt: new Date().toISOString()
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

