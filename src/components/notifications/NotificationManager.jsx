import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNotifications } from '../../hooks/useNotifications'
import ToastNotification from './ToastNotification'

const NotificationManager = () => {
  const { notifications, markAsRead } = useNotifications()
  const [toastNotifications, setToastNotifications] = useState([])

  const newNotifications = useMemo(() => {
    return notifications.filter(
      (n) => !n.read && !toastNotifications.find((t) => t.id === n.id)
    )
  }, [notifications, toastNotifications])

  useEffect(() => {
    if (newNotifications.length > 0) {
      const latestNotification = newNotifications[0]
      setToastNotifications((prev) => [latestNotification, ...prev.slice(0, 2)])
    }
  }, [newNotifications])

  const handleClose = useCallback((notificationId) => {
    setToastNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }, [])

  const closeHandlers = useMemo(() => {
    const handlers = {}
    toastNotifications.forEach((notification) => {
      handlers[notification.id] = () => handleClose(notification.id)
    })
    return handlers
  }, [toastNotifications, handleClose])

  return (
    <>
      {toastNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className="fixed top-20 right-4 z-50"
          style={{ top: `${80 + index * 120}px` }}
        >
          <ToastNotification
            notification={notification}
            onClose={closeHandlers[notification.id]}
            onMarkAsRead={markAsRead}
          />
        </div>
      ))}
    </>
  )
}

export default NotificationManager

