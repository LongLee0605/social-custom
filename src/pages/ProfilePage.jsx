import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import { useUserProfile } from '../hooks/useUserProfile'
import { usePosts } from '../hooks/usePosts'
import PostCard from '../components/posts/PostCard'
import FollowersModal from '../components/profile/FollowersModal'
import { MessageCircle, Settings } from 'lucide-react'

const ProfilePage = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { currentUser, userProfile: currentUserProfile } = useAuth()
  const { userProfile, posts, loading, postsLoading, isFollowing, followUser, unfollowUser } = useUserProfile(
    userId || currentUser?.uid
  )
  const { likePost, addComment, deleteComment } = usePosts()
  const isOwnProfile = !userId || userId === currentUser?.uid
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)
  const [isTogglingFollow, setIsTogglingFollow] = useState(false)

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy người dùng</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <Avatar
            src={userProfile.photoURL}
            alt={userProfile.displayName}
            size="xl"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {userProfile.displayName}
            </h1>
            <p className="text-gray-600 mb-4">{userProfile.bio || 'Chưa có tiểu sử'}</p>
            <div className="flex items-center justify-center md:justify-start space-x-6 mb-4">
              <div>
                <span className="font-semibold">{posts?.length || 0}</span>
                <span className="text-gray-600 ml-1">bài viết</span>
              </div>
              <button
                onClick={() => setShowFollowersModal(true)}
                className="hover:opacity-80 transition-opacity"
              >
                <span className="font-semibold">
                  {Array.isArray(userProfile.followers) ? userProfile.followers.length : 0}
                </span>
                <span className="text-gray-600 ml-1">người theo dõi</span>
              </button>
              <button
                onClick={() => setShowFollowingModal(true)}
                className="hover:opacity-80 transition-opacity"
              >
                <span className="font-semibold">
                  {Array.isArray(userProfile.following) ? userProfile.following.length : 0}
                </span>
                <span className="text-gray-600 ml-1">đang theo dõi</span>
              </button>
            </div>
            {!isOwnProfile && (
              <div className="flex space-x-3">
                <Button
                  variant={isFollowing ? 'secondary' : 'primary'}
                  disabled={isTogglingFollow}
                  onClick={async () => {
                    if (isTogglingFollow) return
                    
                    setIsTogglingFollow(true)
                    try {
                      if (isFollowing) {
                        await unfollowUser()
                      } else {
                        await followUser()
                      }
                    } catch (error) {
                      console.error('Error toggling follow:', error)
                    } finally {
                      setIsTogglingFollow(false)
                    }
                  }}
                >
                  {isTogglingFollow 
                    ? 'Đang xử lý...' 
                    : isFollowing 
                      ? 'Hủy theo dõi' 
                      : 'Theo dõi'
                  }
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/chat?userId=${userId}`)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Nhắn tin
                </Button>
              </div>
            )}
            {isOwnProfile && (
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => navigate('/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Chỉnh sửa trang cá nhân
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Bài viết</h2>
          {posts.length > 0 && (
            <span className="text-sm text-gray-500">{posts.length} bài viết</span>
          )}
        </div>
        {postsLoading ? (
          <Card>
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Đang tải bài viết...</p>
            </div>
          </Card>
        ) : posts.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {isOwnProfile ? 'Bạn chưa có bài viết nào' : 'Người dùng này chưa có bài viết nào'}
              </p>
              {isOwnProfile && (
                <Button onClick={() => navigate('/')}>
                  Tạo bài viết đầu tiên
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={likePost}
                onAddComment={addComment}
                onDeleteComment={deleteComment}
              />
            ))}
          </div>
        )}
      </div>

      <FollowersModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        userIds={userProfile.followers || []}
        title="Người theo dõi"
      />

      <FollowersModal
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        userIds={userProfile.following || []}
        title="Đang theo dõi"
      />
    </div>
  )
}

export default ProfilePage

