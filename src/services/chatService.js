import { findOrCreateChat } from '@/repositories/chatsRepository'

export const getOrCreateChat = async (userId1, userId2) => {
  try {
    return await findOrCreateChat(userId1, userId2)
  } catch (error) {
    console.error('Error getting or creating chat:', error)
    return { success: false, error: error.message }
  }
}
