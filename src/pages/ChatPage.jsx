import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Search, MessageCircle, Plus } from 'lucide-react'
import { useChats } from '../hooks/useChats'
import { useAuth } from '../contexts/AuthContext'
import ChatWindow from '../components/chat/ChatWindow'
import NewChatModal from '../components/chat/NewChatModal'
import ChatListItem from '../components/chat/ChatListItem'
import { getOrCreateChat } from '../services/chatService'

const ChatPage = () => {
  const { chats, loading } = useChats()
  const { currentUser } = useAuth()
  const [selectedChat, setSelectedChat] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const userId = searchParams.get('userId')
    if (userId && currentUser && userId !== currentUser.uid) {
      const openChatWithUser = async () => {
        try {
          const result = await getOrCreateChat(currentUser.uid, userId)
          if (result.success) {
            const chat = chats.find((c) => c.id === result.chatId)
            if (chat) {
              setSelectedChat(chat)
            } else {
              // Nếu chat chưa có trong list, tạo chat mới
              const userDoc = await getDoc(doc(db, 'users', userId))
              if (userDoc.exists()) {
                const userData = userDoc.data()
                setSelectedChat({
                  id: result.chatId,
                  userId: userId,
                  userName: userData.displayName,
                  userPhotoURL: userData.photoURL,
                  isOnline: userData.isOnline || false,
                  lastMessage: '',
                  unreadCount: 0,
                })
              }
            }
          }
        } catch (error) {
          console.error('Error opening chat:', error)
        }
      }
      openChatWithUser()
    }
  }, [searchParams, currentUser, chats])

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats
    const query = searchQuery.toLowerCase()
    return chats.filter((chat) => chat.userName.toLowerCase().includes(query))
  }, [chats, searchQuery])

  const handleNewChat = useCallback(() => {
    setShowNewChatModal(true)
  }, [])

  const handleCloseNewChat = useCallback(() => {
    setShowNewChatModal(false)
  }, [])

  const handleChatSelected = useCallback((chatId, user) => {
    const newChat = {
      id: chatId,
      userId: user.uid,
      userName: user.displayName,
      userPhotoURL: user.photoURL,
      isOnline: user.isOnline || false,
      lastMessage: '',
      unreadCount: 0,
    }
    setSelectedChat(newChat)
  }, [])

  const handleSelectChat = useCallback((chat) => {
    setSelectedChat(chat)
  }, [])

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Tin nhắn</h2>
                <button
                  onClick={handleNewChat}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có tin nhắn nào'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredChats.map((chat) => (
                    <ChatListItem
                      key={chat.id}
                      chat={chat}
                      isSelected={selectedChat?.id === chat.id}
                      onClick={handleSelectChat}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedChat ? (
            <ChatWindow chat={selectedChat} />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Chọn một cuộc trò chuyện để bắt đầu</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <NewChatModal
        isOpen={showNewChatModal}
        onClose={handleCloseNewChat}
        onChatSelected={handleChatSelected}
      />
    </div>
  )
}

export default ChatPage

