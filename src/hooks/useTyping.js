import { useState, useEffect, useRef } from 'react'
import { doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'

export const useTyping = (chatId) => {
  const { currentUser } = useAuth()
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    if (!chatId || !currentUser) return

    const chatDocRef = doc(db, 'chats', chatId)
    const unsubscribe = onSnapshot(chatDocRef, (doc) => {
      const data = doc.data()
      if (data?.typing) {
        const users = Object.entries(data.typing)
          .filter(([userId, isTyping]) => userId !== currentUser.uid && isTyping)
          .map(([userId]) => userId)
        setTypingUsers(users)
      } else {
        setTypingUsers([])
      }
    })

    return unsubscribe
  }, [chatId, currentUser])

  const setTyping = async (typing) => {
    if (!chatId || !currentUser) return

    try {
      const chatDocRef = doc(db, 'chats', chatId)
      await updateDoc(chatDocRef, {
        [`typing.${currentUser.uid}`]: typing,
        updatedAt: serverTimestamp(),
      })

      setIsTyping(typing)

      if (typing) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        typingTimeoutRef.current = setTimeout(() => {
          setTyping(false)
        }, 3000)
      } else {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
      }
    } catch (error) {
      console.error('Error setting typing status:', error)
    }
  }

  return { isTyping, typingUsers, setTyping }
}

