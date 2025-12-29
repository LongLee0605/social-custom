import { useState, useEffect } from 'react'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'

export const useMessages = (chatId) => {
  const { currentUser, userProfile } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!chatId) {
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const messagesData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data()
            if (data.senderId && !data.senderName) {
              try {
                const userDoc = await getDoc(doc(db, 'users', data.senderId))
                if (userDoc.exists()) {
                  return {
                    id: doc.id,
                    ...data,
                    senderName: userDoc.data().displayName,
                    senderPhotoURL: userDoc.data().photoURL,
                  }
                }
              } catch (error) {
                console.error('Error fetching sender info:', error)
              }
            }
            return {
              id: doc.id,
              ...data,
            }
          })
        )
        setMessages(messagesData)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching messages:', error)
        if (error.code === 'permission-denied') {
          console.error('Firestore permission denied. Please configure Security Rules.')
        }
        setLoading(false)
      }
    )

    return unsubscribe
  }, [chatId])

  const sendMessage = async (text, imageURL = null, fileURL = null, fileName = null, fileSize = null) => {
    if (!chatId || !currentUser) return { success: false, error: 'Missing chatId or user' }

    try {
      // Add message to subcollection
      const messageData = {
        senderId: currentUser.uid,
        senderName: userProfile?.displayName || currentUser.displayName,
        senderPhotoURL: userProfile?.photoURL || currentUser.photoURL,
        createdAt: serverTimestamp(),
        read: false,
        sent: true,
        reactions: {},
      }

      if (text) messageData.text = text.trim()
      if (imageURL) {
        messageData.imageURL = imageURL
        messageData.type = 'image'
      }
      if (fileURL) {
        messageData.fileURL = fileURL
        messageData.fileName = fileName
        messageData.fileSize = fileSize
        messageData.type = 'file'
      }

      await addDoc(collection(db, 'chats', chatId, 'messages'), messageData)

      const lastMessage = text || (imageURL ? '📷 Đã gửi một ảnh' : fileName || '📎 Đã gửi một file')
      
      const chatDoc = await getDoc(doc(db, 'chats', chatId))
      const chatData = chatDoc.data()
      const otherParticipant = chatData?.participants?.find((id) => id !== currentUser.uid)
      
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: lastMessage,
        updatedAt: serverTimestamp(),
        ...(otherParticipant && {
          [`unreadCount.${otherParticipant}`]: (chatData?.unreadCount?.[otherParticipant] || 0) + 1,
        }),
      })

      return { success: true }
    } catch (error) {
      console.error('Error sending message:', error)
      return { success: false, error: error.message }
    }
  }

  const editMessage = async (messageId, newText) => {
    if (!chatId || !currentUser || !newText.trim()) return { success: false }

    try {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId)
      await updateDoc(messageRef, {
        text: newText.trim(),
        edited: true,
        editedAt: serverTimestamp(),
      })

      return { success: true }
    } catch (error) {
      console.error('Error editing message:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteMessage = async (messageId) => {
    if (!chatId || !currentUser) return { success: false }

    try {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId)
      const messageDoc = await getDoc(messageRef)
      
      if (messageDoc.exists() && messageDoc.data().senderId === currentUser.uid) {
        await deleteDoc(messageRef)
        return { success: true }
      }

      return { success: false, error: 'Unauthorized' }
    } catch (error) {
      console.error('Error deleting message:', error)
      return { success: false, error: error.message }
    }
  }

  const reactToMessage = async (messageId, emoji) => {
    if (!chatId || !currentUser) return { success: false }

    try {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId)
      const messageDoc = await getDoc(messageRef)
      
      if (!messageDoc.exists()) return { success: false }

      const messageData = messageDoc.data()
      const reactions = messageData.reactions || {}
      const userReactions = reactions[emoji] || []

      if (userReactions.includes(currentUser.uid)) {
        const updatedReactions = userReactions.filter((uid) => uid !== currentUser.uid)
        if (updatedReactions.length === 0) {
          delete reactions[emoji]
        } else {
          reactions[emoji] = updatedReactions
        }
      } else {
        reactions[emoji] = [...userReactions, currentUser.uid]
      }

      await updateDoc(messageRef, {
        reactions: reactions,
      })

      return { success: true }
    } catch (error) {
      console.error('Error reacting to message:', error)
      return { success: false, error: error.message }
    }
  }

  const markAsRead = async () => {
    if (!chatId || !currentUser) return

    try {
      const messagesToUpdate = messages
        .filter((msg) => msg.senderId !== currentUser.uid && !msg.read)
        .map((msg) => msg.id)

      if (messagesToUpdate.length > 0) {
        const batch = messagesToUpdate.map((messageId) =>
          updateDoc(doc(db, 'chats', chatId, 'messages', messageId), {
            read: true,
            readAt: serverTimestamp(),
          })
        )

        await Promise.all(batch)

        await updateDoc(doc(db, 'chats', chatId), {
          [`unreadCount.${currentUser.uid}`]: 0,
        })
      }
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  return {
    messages,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    markAsRead,
  }
}

