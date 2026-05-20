import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import { useUserProfile } from '../hooks/useUserProfile'
import { usePostActions } from '../hooks/usePosts'
import PostCard from '../components/posts/PostCard'
import FollowersModal from '../components/profile/FollowersModal'
import { MessageCircle, Settings } from 'lucide-react'
import Spinner from '@/components/ui/Spinner'

const ProfilePage = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { userProfile, posts, loading, postsLoading, isFollowing, followUser, unfollowUser } = useUserProfile(
    userId || currentUser?.uid
  )
  const { likePost, addComment, deleteComment, reactToComment, replyComment } = usePostActions()
  const isOwnProfile = !userId || userId === currentUser?.uid
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)
  const [isTogglingFollow, setIsTogglingFollow] = useState(false)

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (!userProfile) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-slate-500">Không tìm thấy người dùng</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto page-stack">
      <Card className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <Avatar
            src={userProfile.photoURL}
            alt={userProfile.displayName}
            size="lg"
            className="md:hidden"
          />
          <Avatar
            src={userProfile.photoURL}
            alt={userProfile.displayName}
            size="xl"
            className="hidden md:block"
          />
          <div className="flex-1 text-center md:text-left w-full">
            <h1 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              {userProfile.displayName}
            </h1>
            <p className="mb-3 text-sm text-slate-600 sm:mb-4 sm:text-base">{userProfile.bio || 'Chưa có tiểu sử'}</p>
            <div className="flex items-center justify-center md:justify-start space-x-4 sm:space-x-6 mb-3 sm:mb-4 flex-wrap gap-y-2">
              <div>
                <span className="font-semibold text-sm sm:text-base">{posts?.length || 0}</span>
                <span className="ml-1 text-sm text-slate-600 sm:text-base">bài viết</span>
              </div>
              <button
                onClick={() => setShowFollowersModal(true)}
                className="hover:opacity-80 transition-opacity"
              >
                <span className="font-semibold text-sm sm:text-base">
                  {Array.isArray(userProfile.followers) ? userProfile.followers.length : 0}
                </span>
                <span className="ml-1 text-sm text-slate-600 sm:text-base">người theo dõi</span>
              </button>
              <button
                onClick={() => setShowFollowingModal(true)}
                className="hover:opacity-80 transition-opacity"
              >
                <span className="font-semibold text-sm sm:text-base">
                  {Array.isArray(userProfile.following) ? userProfile.following.length : 0}
                </span>
                <span className="ml-1 text-sm text-slate-600 sm:text-base">đang theo dõi</span>
              </button>
            </div>
            {!isOwnProfile && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
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
                  className="w-full sm:w-auto"
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
                  className="w-full sm:w-auto"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Nhắn tin
                </Button>
              </div>
            )}
            {isOwnProfile && (
              <div className="flex">
                <Button variant="outline" onClick={() => navigate('/settings')} className="w-full sm:w-auto">
                  <Settings className="w-4 h-4 mr-2" />
                  Chỉnh sửa trang cá nhân
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Bài viết</h2>
          {posts.length > 0 && (
            <span className="text-xs text-slate-500 sm:text-sm">{posts.length} bài viết</span>
          )}
        </div>
        {postsLoading ? (
          <Card>
            <div className="py-12 text-center">
              <Spinner label="Đang tải bài viết..." />
            </div>
          </Card>
        ) : posts.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <p className="mb-4 text-slate-500">
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
                onReactComment={reactToComment}
                onReplyComment={replyComment}
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

