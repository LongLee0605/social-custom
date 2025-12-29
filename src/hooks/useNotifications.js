import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'

export const useNotifications = () => {
  const { currentUser } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    let unsubscribe = null

    // Thử query với orderBy trước, nếu lỗi thì fallback về query không có orderBy
    const setupQuery = (useOrderBy = true) => {
      if (unsubscribe) {
        unsubscribe()
      }

      try {
        const q = useOrderBy
          ? query(
              collection(db, 'notifications'),
              where('userId', '==', currentUser.uid),
              orderBy('createdAt', 'desc')
            )
          : query(
              collection(db, 'notifications'),
              where('userId', '==', currentUser.uid)
            )

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const notificationsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            
            // Nếu không có orderBy, sort client-side
            if (!useOrderBy) {
              notificationsData.sort((a, b) => {
                const aTime = a.createdAt?.toMillis?.() || (a.createdAt ? new Date(a.createdAt).getTime() : 0)
                const bTime = b.createdAt?.toMillis?.() || (b.createdAt ? new Date(b.createdAt).getTime() : 0)
                return bTime - aTime
              })
            }
            
            setNotifications(notificationsData)
            const unread = notificationsData.filter((n) => !n.read).length
            setUnreadCount(unread)
            setLoading(false)
          },
          (error) => {
            if (error.code === 'failed-precondition' && useOrderBy) {
              // Composite index chưa được tạo, thử lại không có orderBy
              setupQuery(false)
            } else if (error.code === 'permission-denied') {
              console.error('Firestore permission denied. Please check Security Rules.')
              setLoading(false)
            } else {
              console.error('Error fetching notifications:', error)
              setLoading(false)
            }
          }
        )
      } catch (error) {
        console.error('Error setting up notifications query:', error)
        setLoading(false)
      }
    }

    // Bắt đầu với orderBy, sẽ tự động fallback nếu thiếu index
    setupQuery(true)

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [currentUser])

  const markAsRead = async (notificationId) => {
    if (!currentUser) return

    try {
      const notificationRef = doc(db, 'notifications', notificationId)
      await updateDoc(notificationRef, {
        read: true,
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!currentUser) return

    try {
      const unreadNotifications = notifications.filter((n) => !n.read)
      const updates = unreadNotifications.map((n) =>
        updateDoc(doc(db, 'notifications', n.id), {
          read: true,
        })
      )
      await Promise.all(updates)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  }
}

