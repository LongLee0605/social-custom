import { useState, useMemo, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import PostCard from '../components/posts/PostCard'
import CreatePost from '../components/posts/CreatePost'
import { usePosts } from '../hooks/usePosts'
import { useUserInfo } from '../hooks/useUserInfo'

const HomePage = () => {
  const { userProfile, currentUser } = useAuth()
  const { posts, loading, createPost, likePost, addComment, deleteComment } = usePosts()
  const [showCreatePost, setShowCreatePost] = useState(false)
  const currentUserInfo = useUserInfo(currentUser?.uid)

  const handleOpenCreatePost = useCallback(() => {
    setShowCreatePost(true)
  }, [])

  const handleCloseCreatePost = useCallback(() => {
    setShowCreatePost(false)
  }, [])

  const displayName = useMemo(() => currentUserInfo?.displayName || userProfile?.displayName, [currentUserInfo?.displayName, userProfile?.displayName])
  const photoURL = useMemo(() => currentUserInfo?.photoURL || userProfile?.photoURL, [currentUserInfo?.photoURL, userProfile?.photoURL])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <div className="flex items-center space-x-4">
          <Avatar
            src={photoURL}
            alt={displayName}
            size="md"
          />
          <button
            onClick={handleOpenCreatePost}
            className="flex-1 text-left px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-gray-500"
          >
            Bạn đang nghĩ gì?
          </button>
        </div>
      </Card>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Đang tải bài viết...</p>
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Chưa có bài viết nào</p>
              <Button onClick={handleOpenCreatePost}>
                Tạo bài viết đầu tiên
              </Button>
            </div>
          </Card>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={likePost}
              onAddComment={addComment}
              onDeleteComment={deleteComment}
            />
          ))
        )}
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

