import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Search, MessageCircle, Plus, PenSquare } from 'lucide-react'
import { useChats } from '../hooks/useChats'
import { useAuth } from '../contexts/AuthContext'
import ChatWindow from '../components/chat/ChatWindow'
import NewChatModal from '../components/chat/NewChatModal'
import ChatListItem from '../components/chat/ChatListItem'
import { getOrCreateChat } from '../services/chatService'
import { cn } from '@/lib/cn'

const ChatPage = () => {
  const { chats, loading } = useChats()
  const { currentUser } = useAuth()
  const [selectedChat, setSelectedChat] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
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
                        userId,
                        userName: userData.displayName || 'Người dùng',
                        userPhotoURL: userData.photoURL || null,
                        isOnline: userData.isOnline || false,
                        lastMessage: '',
                        unreadCount: 0,
                      })
                      setSearchParams({})
                    }
                    openingChatRef.current = false
                  })
                  .catch(() => {
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
    if (isManualSelectionRef.current || !selectedChat?.id) return

    const updatedChat = chats.find((c) => c.id === selectedChat.id)
    if (!updatedChat) return

    const hasChanges =
      updatedChat.lastMessage !== selectedChat.lastMessage ||
      updatedChat.unreadCount !== selectedChat.unreadCount ||
      updatedChat.isOnline !== selectedChat.isOnline ||
      updatedChat.userName !== selectedChat.userName ||
      updatedChat.userPhotoURL !== selectedChat.userPhotoURL

    if (hasChanges) {
      setSelectedChat((prev) => {
        if (prev?.id === updatedChat.id && !isManualSelectionRef.current) {
          return { ...prev, ...updatedChat }
        }
        return prev
      })
    }
  }, [chats])

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats
    const q = searchQuery.toLowerCase()
    return chats.filter((chat) => chat.userName?.toLowerCase().includes(q))
  }, [chats, searchQuery])

  const handleChatSelected = useCallback(
    (chatId, user) => {
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
    },
    [setSearchParams]
  )

  const handleSelectChat = useCallback(
    (chat) => {
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
      if (searchParams.get('userId')) setSearchParams({})
      setTimeout(() => {
        isManualSelectionRef.current = false
      }, 3000)
    },
    [searchParams, setSearchParams]
  )

  const mobileChatOpen = Boolean(selectedChat?.id)

  return (
    <div className="mx-auto w-full max-w-7xl page-stack">
      <div
        className={cn(
          'grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 lg:h-[calc(100dvh-var(--layout-header)-4.5rem)]',
          mobileChatOpen && 'max-lg:gap-0'
        )}
      >
        <div className={cn('lg:col-span-1', mobileChatOpen ? 'hidden lg:block' : 'block')}>
          <Card className="flex flex-col lg:h-full max-lg:min-h-[min(60dvh,520px)]">
            <div className="border-b border-surface-border p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Tin nhắn</h2>
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(true)}
                  className="rounded-full p-2 text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-600"
                  title="Tin nhắn mới"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:h-5 sm:w-5" />
                <input
                  type="search"
                  placeholder="Tìm cuộc trò chuyện..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-modern w-full pl-9 text-sm sm:pl-10 sm:text-base"
                />
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto scrollbar-custom">
              {loading ? (
                <div className="py-12 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600" />
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <MessageCircle className="mx-auto mb-3 h-12 w-12 text-slate-200" />
                  <p className="text-sm text-slate-500">
                    {searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có tin nhắn nào'}
                  </p>
                  {!searchQuery && (
                    <Button variant="primary" size="sm" className="mt-4" onClick={() => setShowNewChatModal(true)}>
                      <PenSquare className="mr-2 h-4 w-4" />
                      Bắt đầu trò chuyện
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-surface-border">
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

        <div
          className={cn(
            'lg:col-span-2 lg:h-full lg:min-h-0',
            mobileChatOpen
              ? cn(
                  'max-lg:fixed max-lg:inset-x-0 max-lg:z-30 max-lg:flex max-lg:flex-col max-lg:bg-white',
                  'max-lg:top-[var(--layout-header)]',
                  'max-lg:bottom-[calc(var(--layout-mobile-nav)+env(safe-area-inset-bottom,0px))]'
                )
              : 'hidden lg:block'
          )}
        >
          {selectedChat?.id ? (
            <>
              <div className="my-3 flex shrink-0 items-center gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => setSelectedChat(null)}
                  className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  <span className="text-lg leading-none">←</span>
                  Danh sách
                </button>
              </div>
              <div className="min-h-0 flex-1 lg:h-full">
                <ChatWindow key={selectedChat.id} chat={selectedChat} />
              </div>
            </>
          ) : (
            <Card className="flex h-full min-h-[min(50dvh,400px)] items-center justify-center">
              <div className="px-4 text-center">
                <MessageCircle className="mx-auto mb-4 h-14 w-14 text-slate-200" />
                <p className="font-medium text-slate-700">Chọn một cuộc trò chuyện</p>
                <p className="mt-1 text-sm text-slate-500">Hoặc bắt đầu tin nhắn mới</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowNewChatModal(true)}>
                  Tin nhắn mới
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatSelected={handleChatSelected}
      />
    </div>
  )
}

export default ChatPage
