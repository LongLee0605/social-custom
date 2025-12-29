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

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setNotifications(notificationsData)
        const unread = notificationsData.filter((n) => !n.read).length
        setUnreadCount(unread)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching notifications:', error)
        setLoading(false)
      }
    )

    return unsubscribe
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

