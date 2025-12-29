import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'

export const getOrCreateChat = async (userId1, userId2) => {
  try {
    const chatsRef = collection(db, 'chats')
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId1)
    )

    const snapshot = await getDocs(q)
    const existingChat = snapshot.docs.find((doc) => {
      const data = doc.data()
      return data.participants.includes(userId2) && data.participants.length === 2
    })

    if (existingChat) {
      return { success: true, chatId: existingChat.id }
    }

    const newChatRef = await addDoc(chatsRef, {
      participants: [userId1, userId2],
      lastMessage: '',
      unreadCount: {
        [userId1]: 0,
        [userId2]: 0,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return { success: true, chatId: newChatRef.id }
  } catch (error) {
    console.error('Error getting or creating chat:', error)
    return { success: false, error: error.message }
  }
}
