import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'

export const useChats = () => {
  const { currentUser } = useAuth()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    // Fetch chats where current user is a participant
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid)
    )

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
      const chatsData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const chatData = docSnap.data()
          const otherParticipantId = chatData.participants?.find(
            (id) => id !== currentUser.uid
          )

          if (otherParticipantId) {
            try {
              const userDoc = await getDoc(doc(db, 'users', otherParticipantId))
              if (userDoc.exists()) {
                const userData = userDoc.data()
                return {
                  id: docSnap.id,
                  userId: otherParticipantId,
                  userName: userData.displayName || 'Người dùng',
                  userPhotoURL: userData.photoURL || null,
                  isOnline: userData.isOnline || false,
                  lastMessage: chatData.lastMessage || '',
                  unreadCount: chatData.unreadCount?.[currentUser.uid] || 0,
                  updatedAt: chatData.updatedAt || chatData.createdAt,
                  typing: chatData.typing?.[otherParticipantId] || false,
                }
              }
            } catch (error) {
              console.error(`Error fetching user ${otherParticipantId}:`, error)
            }
          }
          return null
        })
      )

      const validChats = chatsData.filter(Boolean)
      validChats.sort((a, b) => {
        if (!a.updatedAt || !b.updatedAt) {
          if (!a.updatedAt && !b.updatedAt) return 0
          return !a.updatedAt ? 1 : -1
        }
        const aTime = a.updatedAt.toMillis?.() || new Date(a.updatedAt).getTime()
        const bTime = b.updatedAt.toMillis?.() || new Date(b.updatedAt).getTime()
        return bTime - aTime
      })

      setChats(validChats)
      setLoading(false)
    },
    (error) => {
      console.error('Error fetching chats:', error)
      if (error.code === 'permission-denied') {
        console.error('Firestore permission denied. Please configure Security Rules.')
      }
      setLoading(false)
    })

    return unsubscribe
  }, [currentUser])

  return { chats, loading }
}

