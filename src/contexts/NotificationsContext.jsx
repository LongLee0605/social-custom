import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'

const NotificationsContext = createContext(null)

const sortByCreatedAt = (items) =>
  [...items].sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? (a.createdAt ? new Date(a.createdAt).getTime() : 0)
    const tb = b.createdAt?.toMillis?.() ?? (b.createdAt ? new Date(b.createdAt).getTime() : 0)
    return tb - ta
  })

// eslint-disable-next-line react-refresh/only-export-components -- context hook
export const useNotifications = () => {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}

export const NotificationsProvider = ({ children }) => {
  const { currentUser } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return undefined
    }

    let unsubscribe = null

    const subscribe = (withOrderBy) => {
      unsubscribe?.()
      const q = withOrderBy
        ? query(
            collection(db, 'notifications'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
          )
        : query(collection(db, 'notifications'), where('userId', '==', currentUser.uid))

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
          const sorted = withOrderBy ? data : sortByCreatedAt(data)
          setNotifications(sorted)
          setUnreadCount(sorted.filter((n) => !n.read).length)
          setLoading(false)
        },
        (error) => {
          if (error.code === 'failed-precondition' && withOrderBy) {
            subscribe(false)
          } else {
            console.error('Error fetching notifications:', error)
            setLoading(false)
          }
        }
      )
    }

    subscribe(true)
    return () => unsubscribe?.()
  }, [currentUser])

  const markAsRead = useCallback(async (notificationId) => {
    if (!currentUser) return
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [currentUser])

  const markAllAsRead = useCallback(async () => {
    if (!currentUser) return
    try {
      const unread = notifications.filter((n) => !n.read)
      await Promise.all(
        unread.map((n) => updateDoc(doc(db, 'notifications', n.id), { read: true }))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [currentUser, notifications])

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, loading, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}
