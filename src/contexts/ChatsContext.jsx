import { createContext, useContext, useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'

const ChatsContext = createContext(null)

export const useChats = () => {
  const ctx = useContext(ChatsContext)
  if (!ctx) throw new Error('useChats must be used within ChatsProvider')
  return ctx
}

export const ChatsProvider = ({ children }) => {
  const { currentUser } = useAuth()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      setChats([])
      setLoading(false)
      return undefined
    }

    setLoading(true)
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
            const otherParticipantId = chatData.participants?.find((id) => id !== currentUser.uid)
            if (!otherParticipantId) return null

            try {
              const userDoc = await getDoc(doc(db, 'users', otherParticipantId))
              if (!userDoc.exists()) return null
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
            } catch (error) {
              console.error(`Error fetching user ${otherParticipantId}:`, error)
              return null
            }
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
        setLoading(false)
      }
    )

    return unsubscribe
  }, [currentUser])

  return (
    <ChatsContext.Provider value={{ chats, loading }}>
      {children}
    </ChatsContext.Provider>
  )
}
