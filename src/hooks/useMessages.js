import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { createNotification } from '../services/notificationService'

export const useMessages = (chatId) => {
  const { currentUser, userProfile } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [lastMessageDoc, setLastMessageDoc] = useState(null)
  const [sendingMessages, setSendingMessages] = useState(new Map())

  useEffect(() => {
    if (!chatId) {
      setLoading(false)
      setMessages([])
      return
    }

    const messagesRef = collection(db, 'chats', chatId, 'messages')
    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(50))

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        if (snapshot.empty) {
          setMessages([])
          setHasMore(false)
          setLoading(false)
          return
        }

        const messagesData = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data()
            if (data.senderId && !data.senderName) {
              try {
                const userDoc = await getDoc(doc(db, 'users', data.senderId))
                if (userDoc.exists()) {
                  return {
                    id: docSnap.id,
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
              id: docSnap.id,
              ...data,
            }
          })
        )

        const sortedMessages = messagesData.reverse()
        setMessages(sortedMessages)
        setLastMessageDoc(snapshot.docs[snapshot.docs.length - 1])
        setHasMore(snapshot.docs.length === 50)
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

  const loadMoreMessages = useCallback(async () => {
    if (!chatId || !lastMessageDoc || !hasMore) return

    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages')
      const q = query(
        messagesRef,
        orderBy('createdAt', 'desc'),
        startAfter(lastMessageDoc),
        limit(50)
      )

      const snapshot = await getDocs(q)
      if (snapshot.empty) {
        setHasMore(false)
        return
      }

      const newMessages = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data()
          if (data.senderId && !data.senderName) {
            try {
              const userDoc = await getDoc(doc(db, 'users', data.senderId))
              if (userDoc.exists()) {
                return {
                  id: docSnap.id,
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
            id: docSnap.id,
            ...data,
          }
        })
      )

      setMessages((prev) => [...newMessages.reverse(), ...prev])
      setLastMessageDoc(snapshot.docs[snapshot.docs.length - 1])
      setHasMore(snapshot.docs.length === 50)
    } catch (error) {
      console.error('Error loading more messages:', error)
    }
  }, [chatId, lastMessageDoc, hasMore])

  const sendMessage = async (text, imageURL = null, fileURL = null, fileName = null, fileSize = null, retryCount = 0) => {
    if (!chatId || !currentUser) return { success: false, error: 'Missing chatId or user' }

    const tempId = `temp_${Date.now()}_${Math.random()}`
    const optimisticMessage = {
      id: tempId,
      senderId: currentUser.uid,
      senderName: userProfile?.displayName || currentUser.displayName,
      senderPhotoURL: userProfile?.photoURL || currentUser.photoURL,
      createdAt: new Date(),
      read: false,
      sent: false,
      status: 'sending',
      reactions: {},
    }

    if (text) optimisticMessage.text = text.trim()
    if (imageURL) {
      optimisticMessage.imageURL = imageURL
      optimisticMessage.type = 'image'
    }
    if (fileURL) {
      optimisticMessage.fileURL = fileURL
      optimisticMessage.fileName = fileName
      optimisticMessage.fileSize = fileSize
      optimisticMessage.type = 'file'
    }

    setSendingMessages((prev) => new Map(prev).set(tempId, optimisticMessage))
    setMessages((prev) => [...prev, optimisticMessage])

    try {
      const messageData = {
        senderId: currentUser.uid,
        senderName: userProfile?.displayName || currentUser.displayName,
        senderPhotoURL: userProfile?.photoURL || currentUser.photoURL,
        createdAt: serverTimestamp(),
        read: false,
        sent: true,
        status: 'sent',
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

      const docRef = await addDoc(collection(db, 'chats', chatId, 'messages'), messageData)

      setSendingMessages((prev) => {
        const newMap = new Map(prev)
        newMap.delete(tempId)
        return newMap
      })

      setMessages((prev) => prev.filter((msg) => msg.id !== tempId))

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

      // Tạo thông báo cho người nhận
      if (otherParticipant) {
        createNotification({
          userId: otherParticipant,
          type: 'message',
          title: 'Bạn có tin nhắn mới',
          message: `${userProfile?.displayName || currentUser.displayName || 'Ai đó'} đã gửi cho bạn một tin nhắn`,
          link: `/chat?userId=${currentUser.uid}`,
          relatedUserId: currentUser.uid,
        }).catch((error) => {
          console.error('Error creating message notification:', error)
        })
      }

      return { success: true, messageId: docRef.id }
    } catch (error) {
      console.error('Error sending message:', error)
      
      setSendingMessages((prev) => {
        const newMap = new Map(prev)
        const msg = newMap.get(tempId)
        if (msg) {
          msg.status = 'failed'
          newMap.set(tempId, msg)
        }
        return newMap
      })

      setMessages((prev) => prev.map((msg) => 
        msg.id === tempId ? { ...msg, status: 'failed' } : msg
      ))

      if (retryCount < 3) {
        setTimeout(() => {
          sendMessage(text, imageURL, fileURL, fileName, fileSize, retryCount + 1)
        }, 2000 * (retryCount + 1))
      }

      return { success: false, error: error.message, tempId }
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
      
      // Tìm emoji mà user hiện tại đã chọn
      let currentUserEmoji = null
      for (const [reactionEmoji, userIds] of Object.entries(reactions)) {
        if (Array.isArray(userIds) && userIds.includes(currentUser.uid)) {
          currentUserEmoji = reactionEmoji
          break
        }
      }

      // Nếu user đã chọn emoji này rồi, thì xóa nó
      if (currentUserEmoji === emoji) {
        const userReactions = reactions[emoji] || []
        const updatedReactions = userReactions.filter((uid) => uid !== currentUser.uid)
        if (updatedReactions.length === 0) {
          delete reactions[emoji]
        } else {
          reactions[emoji] = updatedReactions
        }
      } else {
        // Nếu user chọn emoji khác, xóa emoji cũ và thêm emoji mới
        if (currentUserEmoji) {
          const oldReactions = reactions[currentUserEmoji] || []
          const updatedOldReactions = oldReactions.filter((uid) => uid !== currentUser.uid)
          if (updatedOldReactions.length === 0) {
            delete reactions[currentUserEmoji]
          } else {
            reactions[currentUserEmoji] = updatedOldReactions
          }
        }
        
        // Thêm emoji mới
        const newReactions = reactions[emoji] || []
        if (!newReactions.includes(currentUser.uid)) {
          reactions[emoji] = [...newReactions, currentUser.uid]
        }
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

  const markAsRead = useCallback(async () => {
    if (!chatId || !currentUser) return

    try {
      const unreadMessages = messages.filter(
        (msg) => msg.senderId !== currentUser.uid && !msg.read && !msg.id?.startsWith('temp_')
      )

      if (unreadMessages.length === 0) return

      const batchSize = 10
      for (let i = 0; i < unreadMessages.length; i += batchSize) {
        const batch = unreadMessages.slice(i, i + batchSize)
        await Promise.all(
          batch.map((msg) =>
            updateDoc(doc(db, 'chats', chatId, 'messages', msg.id), {
              read: true,
              readAt: serverTimestamp(),
            }).catch((error) => {
              console.error(`Error marking message ${msg.id} as read:`, error)
            })
          )
        )
      }

      await updateDoc(doc(db, 'chats', chatId), {
        [`unreadCount.${currentUser.uid}`]: 0,
      }).catch((error) => {
        console.error('Error updating unread count:', error)
      })
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }, [chatId, currentUser, messages])

  const retryFailedMessage = useCallback(async (tempId) => {
    const failedMessage = sendingMessages.get(tempId)
    if (!failedMessage || !chatId || !currentUser) return

    setSendingMessages((prev) => {
      const newMap = new Map(prev)
      const msg = newMap.get(tempId)
      if (msg) {
        msg.status = 'sending'
        newMap.set(tempId, msg)
      }
      return newMap
    })

    setMessages((prev) => prev.map((msg) => 
      msg.id === tempId ? { ...msg, status: 'sending' } : msg
    ))

    await sendMessage(
      failedMessage.text,
      failedMessage.imageURL,
      failedMessage.fileURL,
      failedMessage.fileName,
      failedMessage.fileSize
    )
  }, [sendingMessages, chatId, currentUser, sendMessage])

  return {
    messages,
    loading,
    hasMore,
    loadMoreMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    markAsRead,
    retryFailedMessage,
  }
}

