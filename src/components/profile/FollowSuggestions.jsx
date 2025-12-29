import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useAuth } from '../../contexts/AuthContext'
import Card from '../ui/Card'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import { useUserInfo } from '../../hooks/useUserInfo'
import { UserPlus, X } from 'lucide-react'
import { createNotification } from '../../services/notificationService'

const FollowSuggestions = ({ maxSuggestions = 5 }) => {
  const { currentUser, userProfile } = useAuth()
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(new Set())

  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    const fetchSuggestions = async () => {
      setLoading(true)
      try {
        // Lấy danh sách following của user hiện tại
        const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid))
        const currentUserData = currentUserDoc.exists() ? currentUserDoc.data() : {}
        const followingList = currentUserData.following || []
        setFollowing(new Set(followingList))

        // Lấy tất cả users
        const usersRef = collection(db, 'users')
        const snapshot = await getDocs(usersRef)
        
        const allUsers = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(
            (user) =>
              user.uid &&
              user.uid !== currentUser.uid &&
              !followingList.includes(user.uid)
          )

        // Sắp xếp theo số followers (người có nhiều followers hơn sẽ được đề xuất)
        allUsers.sort((a, b) => {
          const aFollowers = a.followers?.length || 0
          const bFollowers = b.followers?.length || 0
          return bFollowers - aFollowers
        })

        setSuggestions(allUsers.slice(0, maxSuggestions))
      } catch (error) {
        console.error('Error fetching suggestions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [currentUser, maxSuggestions])

  const handleFollow = async (userId) => {
    if (!currentUser) return

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        following: arrayUnion(userId),
      })

      await updateDoc(doc(db, 'users', userId), {
        followers: arrayUnion(currentUser.uid),
      })

      setFollowing((prev) => new Set([...prev, userId]))
      setSuggestions((prev) => prev.filter((user) => user.uid !== userId))

      // Tạo notification
      createNotification({
        userId: userId,
        type: 'follow',
        title: 'Có người theo dõi bạn',
        message: 'đã theo dõi bạn',
        link: `/profile/${currentUser.uid}`,
        relatedUserId: currentUser.uid,
      }).catch(console.error)
    } catch (error) {
      console.error('Error following user:', error)
    }
  }

  if (!currentUser || loading || suggestions.length === 0) {
    return null
  }

  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gợi ý cho bạn</h3>
        <div className="space-y-3">
          {suggestions.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Link
                to={`/profile/${user.uid}`}
                className="flex items-center space-x-3 flex-1 min-w-0"
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
              <Button
                size="sm"
                variant="primary"
                onClick={(e) => {
                  e.preventDefault()
                  handleFollow(user.uid)
                }}
                className="ml-2"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Theo dõi
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default FollowSuggestions

