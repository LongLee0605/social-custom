import { useState, useEffect, memo, useCallback, useMemo, forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import Card from '../ui/Card'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import AlertModal from '../ui/AlertModal'
import Comments from './Comments'
import { useUserInfo } from '../../hooks/useUserInfo'
import { Heart, MessageCircle, Share2, MoreVertical, Trash2 } from 'lucide-react'
import { formatRelativeTime } from '../../utils/formatDate'
import { linkifyText } from '../../utils/linkify'

const PostCard = memo(forwardRef(({ post, onLike, onAddComment, onDeleteComment, onReactComment, onReplyComment }, ref) => {
  const { currentUser } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [liking, setLiking] = useState(false)
  const [showLikeAlert, setShowLikeAlert] = useState(false)
  const [showLikeError, setShowLikeError] = useState({ isOpen: false, message: '' })
  const userInfo = useUserInfo(post.userId)

  const displayName = useMemo(() => userInfo?.displayName || post.userName, [userInfo?.displayName, post.userName])
  const photoURL = useMemo(() => userInfo?.photoURL || null, [userInfo?.photoURL])

  const contentParts = useMemo(() => {
    if (!post.content) return []
    return linkifyText(post.content)
  }, [post.content])

  useEffect(() => {
    setIsLiked(post.likes?.includes(currentUser?.uid) || false)
    setLikeCount(post.likes?.length || 0)
  }, [post.likes, currentUser?.uid])

  const handleLike = useCallback(async () => {
    if (!currentUser) {
      setShowLikeAlert(true)
      return
    }

    if (liking) return

    setLiking(true)
    const newIsLiked = !isLiked
    setIsLiked(newIsLiked)
    setLikeCount(newIsLiked ? likeCount + 1 : likeCount - 1)

    try {
      if (onLike) {
        const result = await onLike(post.id, isLiked)
        if (!result.success) {
          setIsLiked(!newIsLiked)
          setLikeCount(newIsLiked ? likeCount : likeCount + 1)
          setShowLikeError({ isOpen: true, message: result.error || 'Có lỗi xảy ra khi thích bài viết' })
        }
      }
    } catch (error) {
      console.error('Error liking post:', error)
      setIsLiked(!newIsLiked)
      setLikeCount(newIsLiked ? likeCount : likeCount + 1)
    } finally {
      setLiking(false)
    }
  }, [currentUser, liking, isLiked, likeCount, onLike, post.id])

  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!currentUser || post.userId !== currentUser.uid) return

    setDeleting(true)
    try {
      await deleteDoc(doc(db, 'posts', post.id))
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Error deleting post:', error)
      setShowLikeError({ 
        isOpen: true, 
        message: error.message || 'Có lỗi xảy ra khi xóa bài viết' 
      })
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }, [currentUser, post.userId, post.id])

  const toggleComments = useCallback(() => {
    setShowComments(prev => !prev)
  }, [])

  const toggleMenu = useCallback(() => {
    setShowMenu(prev => !prev)
  }, [])


  return (
    <Card ref={ref} id={`post-${post.id}`} className="p-3 sm:p-6">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <Link to={`/profile/${post.userId}`} className="flex-shrink-0">
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
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                to={`/profile/${post.userId}`}
                className="font-semibold text-sm sm:text-base text-gray-900 hover:text-primary-600 block truncate"
              >
                {displayName}
              </Link>
              <p className="text-xs sm:text-sm text-gray-500">{formatRelativeTime(post.createdAt)}</p>
            </div>
          </div>
          {post.userId === currentUser?.uid && (
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa bài viết</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {post.content && (
          <p className="text-sm sm:text-base text-gray-900 whitespace-pre-wrap break-words">
            {contentParts.map((part, index) => {
              if (part.type === 'link') {
                return (
                  <a
                    key={index}
                    href={part.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 underline hover:opacity-80 transition-opacity break-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {part.displayUrl}
                  </a>
                )
              }
              return <span key={index}>{part.content}</span>
            })}
          </p>
        )}

        {post.imageURL && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={post.imageURL}
              alt="Post"
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1.5 sm:space-x-2 transition-colors ${
                isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm sm:text-base">{likeCount}</span>
            </button>
            <button
              onClick={toggleComments}
              className={`flex items-center space-x-1.5 sm:space-x-2 transition-colors ${
                showComments ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">{post.commentCount || post.comments?.length || 0}</span>
            </button>
            <button className="hidden sm:flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors">
              <Share2 className="w-5 h-5" />
              <span>Chia sẻ</span>
            </button>
          </div>
        </div>
      </div>

      {showComments && (
        <Comments
          post={post}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
          onReactComment={onReactComment}
          onReplyComment={onReplyComment}
        />
      )}

      <AlertModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        type="warning"
        title="Xác nhận xóa"
        message="Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn tác."
        onConfirm={confirmDelete}
      />

      <AlertModal
        isOpen={showLikeAlert}
        onClose={() => setShowLikeAlert(false)}
        type="info"
        title="Thông báo"
        message="Bạn cần đăng nhập để thích bài viết"
      />

      <AlertModal
        isOpen={showLikeError.isOpen}
        onClose={() => setShowLikeError({ isOpen: false, message: '' })}
        type="error"
        title="Lỗi"
        message={showLikeError.message}
      />
    </Card>
  )
}))

PostCard.displayName = 'PostCard'

export default PostCard

