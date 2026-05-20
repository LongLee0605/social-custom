import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import PostCard from '@/components/posts/PostCard'
import CreatePost from '@/components/posts/CreatePost'
import FollowSuggestions from '@/components/profile/FollowSuggestions'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import { usePosts } from '@/hooks/usePosts'
import { useUserInfo } from '@/hooks/useUserInfo'

const FEED_OPTIONS = [
  { value: 'following', label: 'Đang theo dõi' },
  { value: 'all', label: 'Tất cả' },
]

const HomePage = () => {
  const { userProfile, currentUser } = useAuth()
  const [feedMode, setFeedMode] = useState('following')
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [searchParams] = useSearchParams()
  const { posts, loading, createPost, likePost, addComment, deleteComment, reactToComment, replyComment } =
    usePosts(feedMode === 'following')
  const userInfo = useUserInfo(currentUser?.uid)

  const displayName = userInfo?.displayName || userProfile?.displayName
  const photoURL = userInfo?.photoURL || userProfile?.photoURL

  useEffect(() => {
    const postId = searchParams.get('postId')
    if (!postId || !posts.length) return
    const timer = setTimeout(() => {
      const el = document.getElementById(`post-${postId}`)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ring-2', 'ring-brand-500', 'ring-offset-2')
      setTimeout(() => el.classList.remove('ring-2', 'ring-brand-500', 'ring-offset-2'), 3000)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchParams, posts])

  const postActions = { onLike: likePost, onAddComment: addComment, onDeleteComment: deleteComment, onReactComment: reactToComment, onReplyComment: replyComment }

  return (
    <div className="page-stack animate-fade-in">
      <div className="content-grid">
        <div className="content-main">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Avatar src={photoURL} alt={displayName} size="md" />
              <button type="button" onClick={() => setShowCreatePost(true)} className="composer-trigger">
                Bạn đang nghĩ gì, {displayName?.split(' ')[0] || 'bạn'}?
              </button>
            </div>
            {currentUser && (
              <SegmentedControl value={feedMode} onChange={setFeedMode} options={FEED_OPTIONS} />
            )}
          </Card>

          {loading ? (
            <Card>
              <Spinner label="Đang tải bài viết..." />
            </Card>
          ) : posts.length === 0 ? (
            <Card>
              <EmptyState
                message={
                  feedMode === 'following'
                    ? 'Chưa có bài từ người bạn theo dõi. Khám phá và kết bạn thêm nhé!'
                    : 'Chưa có bài viết nào. Hãy là người đầu tiên đăng bài.'
                }
                actionLabel={feedMode === 'all' ? 'Tạo bài viết' : undefined}
                onAction={feedMode === 'all' ? () => setShowCreatePost(true) : undefined}
              />
            </Card>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} {...postActions} />)
          )}
        </div>

        <aside className="content-aside">
          <FollowSuggestions maxSuggestions={5} />
        </aside>
      </div>

      {showCreatePost && (
        <CreatePost isOpen onClose={() => setShowCreatePost(false)} onCreatePost={createPost} />
      )}
    </div>
  )
}

export default HomePage
