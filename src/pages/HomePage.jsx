import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import PostCard from '../components/posts/PostCard'
import CreatePost from '../components/posts/CreatePost'
import FollowSuggestions from '../components/profile/FollowSuggestions'
import { usePosts } from '../hooks/usePosts'
import { useUserInfo } from '../hooks/useUserInfo'

const HomePage = () => {
  const { userProfile, currentUser } = useAuth()
  const [feedMode, setFeedMode] = useState('following') // 'all' or 'following'
  const { posts, loading, createPost, likePost, addComment, deleteComment, reactToComment, replyComment } = usePosts(feedMode === 'following')
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [searchParams] = useSearchParams()
  const postRefs = useRef({})
  const currentUserInfo = useUserInfo(currentUser?.uid)

  useEffect(() => {
    const postId = searchParams.get('postId')
    if (postId && posts.length > 0) {
      const timer = setTimeout(() => {
        const postElement = document.getElementById(`post-${postId}`)
        if (postElement) {
          postElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          postElement.classList.add('ring-2', 'ring-primary-500', 'ring-offset-2')
          setTimeout(() => {
            postElement.classList.remove('ring-2', 'ring-primary-500', 'ring-offset-2')
          }, 3000)
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [searchParams, posts])

  const handleOpenCreatePost = useCallback(() => {
    setShowCreatePost(true)
  }, [])

  const handleCloseCreatePost = useCallback(() => {
    setShowCreatePost(false)
  }, [])

  const displayName = useMemo(() => currentUserInfo?.displayName || userProfile?.displayName, [currentUserInfo?.displayName, userProfile?.displayName])
  const photoURL = useMemo(() => currentUserInfo?.photoURL || userProfile?.photoURL, [currentUserInfo?.photoURL, userProfile?.photoURL])

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
      <Card className="p-3 sm:p-6">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Avatar
            src={photoURL}
            alt={displayName}
            size="sm"
            className="sm:hidden"
          />
          <Avatar
            src={photoURL}
            alt={displayName}
            size="md"
            className="hidden sm:block"
          />
          <button
            onClick={handleOpenCreatePost}
            className="flex-1 text-left px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-gray-500"
          >
            Bạn đang nghĩ gì?
          </button>
        </div>
      </Card>

      {currentUser && (
        <Card className="p-0">
          <div className="flex items-center border-b border-gray-200">
            <button
              onClick={() => setFeedMode('following')}
              className={`flex-1 py-2 sm:py-3 text-center text-sm sm:text-base font-medium transition-colors ${
                feedMode === 'following'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Đang theo dõi
            </button>
            <button
              onClick={() => setFeedMode('all')}
              className={`flex-1 py-2 sm:py-3 text-center text-sm sm:text-base font-medium transition-colors ${
                feedMode === 'all'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tất cả
            </button>
          </div>
        </Card>
      )}

          <div className="space-y-4 sm:space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Đang tải bài viết...</p>
              </div>
            ) : posts.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    {feedMode === 'following' 
                      ? 'Chưa có bài viết từ người bạn đang theo dõi. Hãy theo dõi thêm người dùng khác!' 
                      : 'Chưa có bài viết nào'}
                  </p>
                  {feedMode === 'all' && (
                    <Button onClick={handleOpenCreatePost}>
                      Tạo bài viết đầu tiên
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  ref={(el) => (postRefs.current[post.id] = el)}
                  post={post}
                  onLike={likePost}
                  onAddComment={addComment}
                  onDeleteComment={deleteComment}
                  onReactComment={reactToComment}
                  onReplyComment={replyComment}
                />
              ))
            )}
          </div>
        </div>

        <div className="hidden lg:block space-y-6">
          <FollowSuggestions maxSuggestions={5} />
        </div>
      </div>

      {showCreatePost && (
        <CreatePost
          isOpen={showCreatePost}
          onClose={handleCloseCreatePost}
          onCreatePost={createPost}
        />
      )}
    </div>
  )
}

export default HomePage

