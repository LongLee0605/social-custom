import { useState, useEffect, useCallback, useMemo } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../config/firebase'
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

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchUsers()
    } else {
      setSearchQuery('')
      setUsers([])
    }
  }, [isOpen, currentUser])

  const fetchUsers = async () => {
    if (!currentUser) return

    setLoading(true)
    try {
      const usersRef = collection(db, 'users')
      const snapshot = await getDocs(usersRef)
      const usersData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user) => user.uid && user.uid !== currentUser.uid)
        .sort((a, b) => {
          const nameA = (a.displayName || '').toLowerCase()
          const nameB = (b.displayName || '').toLowerCase()
          return nameA.localeCompare(nameB)
        })
        .slice(0, 50)

      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() || !currentUser) {
      fetchUsers()
      return
    }

    setLoading(true)
    try {
      const usersRef = collection(db, 'users')
      const snapshot = await getDocs(usersRef)
      const allUsers = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (user) =>
            user.uid !== currentUser.uid &&
            (user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
        )

      setUsers(allUsers)
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setLoading(false)
    }
  }

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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            placeholder="Tìm kiếm người dùng..."
            className="pl-10"
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'Không tìm thấy người dùng' : 'Chưa có người dùng nào'}
            </div>
          ) : (
            <div className="space-y-1">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full p-3 hover:bg-gray-50 rounded-lg transition-colors text-left flex items-center space-x-3"
                >
                  <Avatar
                    src={user.photoURL}
                    alt={user.displayName}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {user.displayName || 'Người dùng'}
                    </p>
                    {user.email && (
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
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

