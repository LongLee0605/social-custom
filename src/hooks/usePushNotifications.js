import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  requestNotificationPermission,
  getFCMToken,
  deleteTokenFromFirestore,
  onMessageListener,
} from '../services/pushNotificationService'

export const usePushNotifications = () => {
  const { currentUser } = useAuth()
  const [fcmToken, setFcmToken] = useState(null)
  const [permission, setPermission] = useState(Notification.permission || 'default')
  const [isSupported, setIsSupported] = useState(false)

  // Kiểm tra browser support
  useEffect(() => {
    const checkSupport = () => {
      const supported =
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
      setIsSupported(supported)
    }
    checkSupport()
  }, [])

  // Kiểm tra permission
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  // Khởi tạo push notifications
  const initializePushNotifications = useCallback(async () => {
    if (!isSupported || !currentUser) {
      return
    }

    try {
      // Yêu cầu permission
      const permissionResult = await requestNotificationPermission()
      setPermission(permissionResult)

      if (permissionResult === 'granted') {
        // Lấy FCM token
        const token = await getFCMToken()
        if (token) {
          setFcmToken(token)
        }
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error)
    }
  }, [isSupported, currentUser])

  // Đăng ký push notifications
  const handleSubscribe = useCallback(async () => {
    await initializePushNotifications()
  }, [initializePushNotifications])

  // Hủy đăng ký push notifications
  const handleUnsubscribe = useCallback(async () => {
    if (fcmToken) {
      await deleteTokenFromFirestore(fcmToken)
      setFcmToken(null)
    }
  }, [fcmToken])

  // Đăng ký push notifications khi user đăng nhập
  useEffect(() => {
    if (currentUser && isSupported) {
      initializePushNotifications()
    } else if (!currentUser && fcmToken) {
      // Xóa token khi logout
      handleUnsubscribe()
    }
  }, [currentUser, isSupported, fcmToken, initializePushNotifications, handleUnsubscribe])

  // Lắng nghe tin nhắn khi app đang mở
  useEffect(() => {
    if (!currentUser || !isSupported) return

    const setupMessageListener = async () => {
      try {
        const payload = await onMessageListener()
        if (payload) {
          console.log('Foreground message:', payload)
        }
      } catch (error) {
        console.error('Error setting up message listener:', error)
      }
    }
    setupMessageListener()
  }, [currentUser, isSupported])

  return {
    fcmToken,
    permission,
    isSupported,
    subscribe: handleSubscribe,
    unsubscribe: handleUnsubscribe,
  }
}

