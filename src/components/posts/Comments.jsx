import { useState, memo, useCallback, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import AlertModal from '../ui/AlertModal'
import { formatRelativeTime } from '../../utils/formatDate'
import { Trash2, Send } from 'lucide-react'
import { useUserInfo } from '../../hooks/useUserInfo'

const CurrentUserAvatar = memo(() => {
  const { currentUser } = useAuth()
  const currentUserInfo = useUserInfo(currentUser?.uid)

  return (
    <Avatar
      src={currentUserInfo?.photoURL || null}
      alt={currentUserInfo?.displayName || currentUser?.displayName}
      size="sm"
    />
  )
})

CurrentUserAvatar.displayName = 'CurrentUserAvatar'

const CommentItem = memo(({ comment, currentUser, onDelete }) => {
  const userInfo = useUserInfo(comment.userId)
  
  if (!comment.userId) {
    return null
  }

  const handleDelete = useCallback(() => {
    onDelete(comment.id)
  }, [onDelete, comment.id])

  return (
    <div className="flex items-start space-x-3 group">
      <Avatar
        src={userInfo?.photoURL || null}
        alt={userInfo?.displayName || comment.userName}
        size="sm"
      />
      <div className="flex-1">
        <div className="bg-gray-100 rounded-lg px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-sm text-gray-900">
              {userInfo?.displayName || comment.userName}
            </span>
            {comment.userId === currentUser?.uid && (
              <button
                onClick={handleDelete}
                className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-700">{comment.text}</p>
        </div>
        <div className="flex items-center space-x-3 mt-1 px-1">
          <span className="text-xs text-gray-500">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
      </div>
    </div>
  )
})

CommentItem.displayName = 'CommentItem'

const Comments = memo(({ post, onAddComment, onDeleteComment }) => {
  const { currentUser } = useAuth()
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [alert, setAlert] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null })

  const comments = useMemo(() => post.comments || [], [post.comments])
  const displayComments = useMemo(() => showAll ? comments : comments.slice(-3), [showAll, comments])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!commentText.trim() || loading) return

    setLoading(true)
    try {
      const result = await onAddComment(post.id, commentText)
      if (result.success) {
        setCommentText('')
      } else {
        setAlert({
          isOpen: true,
          type: 'error',
          title: 'Lỗi',
          message: result.error || 'Có lỗi xảy ra khi thêm bình luận',
        })
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Lỗi',
        message: 'Có lỗi xảy ra khi thêm bình luận',
      })
    } finally {
      setLoading(false)
    }
  }, [commentText, loading, onAddComment, post.id])

  const handleDelete = useCallback((commentId) => {
    setAlert({
      isOpen: true,
      type: 'warning',
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc muốn xóa bình luận này? Hành động này không thể hoàn tác.',
      onConfirm: async () => {
        try {
          const result = await onDeleteComment(post.id, commentId)
          if (!result.success) {
            setAlert({
              isOpen: true,
              type: 'error',
              title: 'Lỗi',
              message: result.error || 'Có lỗi xảy ra khi xóa bình luận',
              onConfirm: null,
            })
          } else {
            setAlert({ ...alert, isOpen: false, onConfirm: null })
          }
        } catch (error) {
          console.error('Error deleting comment:', error)
          setAlert({
            isOpen: true,
            type: 'error',
            title: 'Lỗi',
            message: 'Có lỗi xảy ra khi xóa bình luận',
            onConfirm: null,
          })
        }
      },
    })
  }, [onDeleteComment, post.id])

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      {comments.length > 0 && (
        <div className="space-y-3 mb-4">
          {comments.length > 3 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Xem tất cả {comments.length} bình luận
            </button>
          )}
          {displayComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onDelete={handleDelete}
            />
          ))}
          {showAll && comments.length > 3 && (
            <button
              onClick={() => setShowAll(false)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Thu gọn
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <CurrentUserAvatar />
        <div className="flex-1 flex items-center space-x-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Viết bình luận..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={loading}
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!commentText.trim() || loading}
            className="rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false, onConfirm: null })}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onConfirm={alert.onConfirm}
      />
    </div>
  )
})

Comments.displayName = 'Comments'

export default Comments

