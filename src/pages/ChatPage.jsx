import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const hasOpenedChatRef = useRef(false)
  const openingChatRef = useRef(false)
  const isManualSelectionRef = useRef(false)

  useEffect(() => {
    const userId = searchParams.get('userId')
    
    if (userId && currentUser?.uid && userId !== currentUser.uid && !hasOpenedChatRef.current && !openingChatRef.current) {
      const openChatWithUser = async () => {
        try {
          openingChatRef.current = true
          hasOpenedChatRef.current = true
          const result = await getOrCreateChat(currentUser.uid, userId)
          
          if (result.success) {
            setTimeout(() => {
              const chat = chats.find((c) => c.id === result.chatId)
              if (chat) {
                setSelectedChat(chat)
                setSearchParams({})
                openingChatRef.current = false
              } else {
                getDoc(doc(db, 'users', userId))
                  .then((userDoc) => {
                    if (userDoc.exists()) {
                      const userData = userDoc.data()
                      setSelectedChat({
                        id: result.chatId,
                        userId: userId,
                        userName: userData.displayName || 'Người dùng',
                        userPhotoURL: userData.photoURL || null,
                        isOnline: userData.isOnline || false,
                        lastMessage: '',
                        unreadCount: 0,
                      })
                      setSearchParams({})
                      openingChatRef.current = false
                    }
                  })
                  .catch((error) => {
                    console.error('Error fetching user:', error)
                    openingChatRef.current = false
                  })
              }
            }, 500)
          }
        } catch (error) {
          console.error('Error opening chat:', error)
          openingChatRef.current = false
          hasOpenedChatRef.current = false
        }
      }
      openChatWithUser()
    }

    return () => {
      if (!searchParams.get('userId')) {
        hasOpenedChatRef.current = false
      }
    }
  }, [searchParams, currentUser, chats, setSearchParams])

  useEffect(() => {
    if (isManualSelectionRef.current || !selectedChat?.id) {
      return
    }

    const updatedChat = chats.find((c) => c.id === selectedChat.id)
    if (updatedChat) {
      const hasChanges = 
        updatedChat.lastMessage !== selectedChat.lastMessage ||
        updatedChat.unreadCount !== selectedChat.unreadCount ||
        updatedChat.isOnline !== selectedChat.isOnline ||
        updatedChat.userName !== selectedChat.userName ||
        updatedChat.userPhotoURL !== selectedChat.userPhotoURL
      
      if (hasChanges) {
        setSelectedChat(prev => {
          if (prev?.id === updatedChat.id && !isManualSelectionRef.current) {
            return { ...prev, ...updatedChat }
          }
          return prev
        })
      }
    }
  }, [chats])

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
    isManualSelectionRef.current = true
    
    setSelectedChat({
      id: chatId,
      userId: user.uid,
      userName: user.displayName,
      userPhotoURL: user.photoURL,
      isOnline: user.isOnline || false,
      lastMessage: '',
      unreadCount: 0,
    })
    
    setSearchParams({})
    
    setTimeout(() => {
      isManualSelectionRef.current = false
    }, 500)
  }, [setSearchParams])

  const handleSelectChat = useCallback((chat) => {
    if (!chat?.id) return
    
    isManualSelectionRef.current = true
    
    setSelectedChat({
      id: chat.id,
      userId: chat.userId,
      userName: chat.userName,
      userPhotoURL: chat.userPhotoURL,
      isOnline: chat.isOnline,
      lastMessage: chat.lastMessage || '',
      unreadCount: chat.unreadCount || 0,
      updatedAt: chat.updatedAt,
    })
    
    if (searchParams.get('userId')) {
      setSearchParams({})
    }
    
    setTimeout(() => {
      isManualSelectionRef.current = false
    }, 3000)
  }, [searchParams, setSearchParams])

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] lg:h-[calc(100vh-12rem)]">
        <div className={`lg:col-span-1 ${selectedChat?.id ? 'hidden lg:block' : 'block'}`}>
          <Card className="h-full flex flex-col">
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Tin nhắn</h2>
                <button
                  onClick={handleNewChat}
                  className="p-1.5 sm:p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="Tin nhắn mới"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm sm:text-base px-4">
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

        <div className={`lg:col-span-2 ${selectedChat?.id ? 'block' : 'hidden lg:block'}`}>
          {selectedChat?.id ? (
            <>
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <span>←</span>
                  <span>Quay lại</span>
                </button>
              </div>
              <ChatWindow key={selectedChat.id} chat={selectedChat} />
            </>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500 px-4">
                <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-sm sm:text-base">Chọn một cuộc trò chuyện để bắt đầu</p>
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

