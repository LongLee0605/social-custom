import { useState, useEffect, useCallback } from 'react'
import { searchUsersByPrefix, searchUsersFallback } from '@/repositories/usersRepository'
import { useAuth } from '../../contexts/AuthContext'
import Modal from '../ui/Modal'
import Avatar from '../ui/Avatar'
import Input from '../ui/Input'
import { Search } from 'lucide-react'
import { getOrCreateChat } from '../../services/chatService'

const NewChatModal = ({ isOpen, onClose, onChatSelected }) => {
  const { currentUser } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const loadUsers = useCallback(
    async (query = '') => {
      if (!currentUser) return
      setLoading(true)
      try {
        let results = []
        if (query.trim()) {
          results = await searchUsersByPrefix(query, currentUser.uid, 50)
          if (results.length === 0) {
            results = await searchUsersFallback(query, currentUser.uid, 50)
          }
        } else {
          results = await searchUsersFallback('', currentUser.uid, 50)
        }
        setUsers(
          results.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''))
        )
      } catch (error) {
        console.error('Error loading users:', error)
        setUsers([])
      } finally {
        setLoading(false)
      }
    },
    [currentUser]
  )

  useEffect(() => {
    if (!isOpen || !currentUser) {
      setSearchQuery('')
      setUsers([])
      return
    }
    const timer = setTimeout(() => loadUsers(searchQuery), searchQuery ? 300 : 0)
    return () => clearTimeout(timer)
  }, [isOpen, currentUser, searchQuery, loadUsers])

  const handleSelectUser = async (user) => {
    if (!currentUser) return
    try {
      const result = await getOrCreateChat(currentUser.uid, user.uid)
      if (result.success && onChatSelected) {
        onChatSelected(result.chatId, user)
      }
      onClose()
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tin nhắn mới" size="md">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên..."
            className="pl-10"
          />
        </div>

        <div className="max-h-[min(50dvh,400px)] overflow-y-auto scrollbar-custom">
          {loading ? (
            <div className="py-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600" />
            </div>
          ) : users.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              {searchQuery ? 'Không tìm thấy người dùng' : 'Chưa có người dùng'}
            </p>
          ) : (
            <div className="space-y-0.5">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectUser(user)}
                  className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-brand-50"
                >
                  <Avatar src={user.photoURL} alt={user.displayName} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">
                      {user.displayName || 'Người dùng'}
                    </p>
                    {user.email && (
                      <p className="truncate text-sm text-slate-500">{user.email}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default NewChatModal
