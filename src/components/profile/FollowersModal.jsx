import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import Modal from '../ui/Modal'
import Avatar from '../ui/Avatar'
import { useUserInfo } from '../../hooks/useUserInfo'
import { X } from 'lucide-react'

const FollowersModal = ({ isOpen, onClose, userIds, title = 'Người theo dõi' }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen || !userIds || userIds.length === 0) {
      setUsers([])
      setLoading(false)
      return
    }

    const fetchUsers = async () => {
      setLoading(true)
      try {
        const usersData = await Promise.all(
          userIds.map(async (uid) => {
            try {
              const userDoc = await getDoc(doc(db, 'users', uid))
              if (userDoc.exists()) {
                return {
                  id: userDoc.id,
                  ...userDoc.data(),
                }
              }
            } catch (error) {
              console.error(`Error fetching user ${uid}:`, error)
            }
            return null
          })
        )

        setUsers(usersData.filter(Boolean))
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [isOpen, userIds])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Chưa có {title.toLowerCase()}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {users.map((user) => (
              <Link
                key={user.id}
                to={`/profile/${user.uid}`}
                onClick={onClose}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
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
                  {user.bio && (
                    <p className="text-sm text-gray-500 truncate">{user.bio}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default FollowersModal

