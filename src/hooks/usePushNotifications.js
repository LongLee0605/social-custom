import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  requestNotificationPermission,
  getFCMToken,
  onMessageListener,
  deleteTokenFromFirestore
} from '../services/pushNotificationService'

export const usePushNotifications = () => {
  const { currentUser } = useAuth()
  const [fcmToken, setFcmToken] = useState(null)
  const [permission, setPermission] = useState(typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Kiểm tra browser support
    const checkSupport = () => {
      const supported = 
        'Notification' in window &&
        'serviceWorker' in navigator &&
        'PushManager' in window
      setIsSupported(supported)
    }

    checkSupport()

    // Kiểm tra permission status
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  // Đăng ký push notifications khi user đăng nhập
  useEffect(() => {
    if (currentUser && isSupported) {
      initializePushNotifications()
    } else if (!currentUser && fcmToken) {
      // Xóa token khi logout
      handleUnsubscribe()
    }
  }, [currentUser, isSupported, fcmToken]) // eslint-disable-line react-hooks/exhaustive-deps

  // Lắng nghe tin nhắn khi app đang mở
  useEffect(() => {
    if (!currentUser || !isSupported) return

    const setupMessageListener = async () => {
      try {
        const payload = await onMessageListener()
        if (payload) {
          // Hiển thị notification trong app (ToastNotification đã xử lý)
          console.log('Foreground message:', payload)
        }
      } catch (error) {
        console.error('Error setting up message listener:', error)
      }
    }

    setupMessageListener()
  }, [currentUser, isSupported])

  const initializePushNotifications = useCallback(async () => {
    if (!isSupported) {
      console.log('Push notifications not supported')
      return
    }

    try {
      const token = await requestNotificationPermission()
      if (token) {
        setFcmToken(token)
        setPermission('granted')
      } else {
        setPermission(Notification.permission)
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error)
      setPermission(Notification.permission)
    }
  }, [isSupported])

  const handleSubscribe = useCallback(async () => {
    if (!isSupported) {
      alert('Trình duyệt của bạn không hỗ trợ push notifications')
      return false
    }

    try {
      const token = await requestNotificationPermission()
      if (token) {
        setFcmToken(token)
        setPermission('granted')
        return true
      } else {
        setPermission(Notification.permission)
        return false
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      return false
    }
  }, [isSupported])

  const handleUnsubscribe = useCallback(async () => {
    if (fcmToken) {
      try {
        await deleteTokenFromFirestore(fcmToken)
        setFcmToken(null)
      } catch (error) {
        console.error('Error unsubscribing from push notifications:', error)
      }
    }
  }, [fcmToken])

  return {
    fcmToken,
    permission,
    isSupported,
    subscribe: handleSubscribe,
    unsubscribe: handleUnsubscribe
  }
}

