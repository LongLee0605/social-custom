import { useState, memo, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import AlertModal from '../ui/AlertModal'
import CommentReactions from './CommentReactions'
import { formatRelativeTime } from '../../utils/formatDate'
import { Trash2, Send, Reply } from 'lucide-react'
import { useUserInfo } from '../../hooks/useUserInfo'
import { linkifyText } from '../../utils/linkify'

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

const CommentItem = memo(({ comment, currentUser, onDelete, onReact, onReply, replyToUser, level = 0 }) => {
  const userInfo = useUserInfo(comment.userId)
  const currentUserInfo = useUserInfo(currentUser?.uid)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)
  
  if (!comment.userId) {
    return null
  }

  const handleDelete = useCallback(() => {
    onDelete(comment.id)
  }, [onDelete, comment.id])

  const handleReact = useCallback((emoji) => {
    if (onReact) {
      onReact(comment.id, emoji)
    }
  }, [onReact, comment.id])

  const handleReplyClick = useCallback(() => {
    setShowReplyInput(true)
  }, [])

  const handleReplySubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!replyText.trim() || replying) return

    setReplying(true)
    try {
      const result = await onReply(comment.id, replyText.trim(), comment.userId, comment.userName)
      if (result.success) {
        setReplyText('')
        setShowReplyInput(false)
      }
    } catch (error) {
      console.error('Error replying to comment:', error)
    } finally {
      setReplying(false)
    }
  }, [replyText, replying, onReply, comment.id, comment.userId, comment.userName])

  const textParts = useMemo(() => {
    if (!comment.text) return []
    return linkifyText(comment.text)
  }, [comment.text])

  const canReply = level < 2

  return (
    <div className={`${level > 0 ? 'ml-4 sm:ml-6 mt-2' : ''}`}>
      <div className="flex items-start space-x-2 sm:space-x-3 group">
        <Link to={`/profile/${comment.userId}`} className="flex-shrink-0">
          <Avatar
            src={userInfo?.photoURL || null}
            alt={userInfo?.displayName || comment.userName}
            size="sm"
            className="hover:opacity-80 transition-opacity"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1 sm:space-x-2 flex-1 min-w-0">
                <Link
                  to={`/profile/${comment.userId}`}
                  className="font-semibold text-xs sm:text-sm text-gray-900 hover:text-primary-600 transition-colors"
                >
                  {userInfo?.displayName || comment.userName}
                </Link>
                {replyToUser && (
                  <>
                    <span className="text-xs sm:text-sm text-gray-500">→</span>
                    <Link
                      to={`/profile/${replyToUser.userId}`}
                      className="font-semibold text-xs sm:text-sm text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      {replyToUser.userName}
                    </Link>
                  </>
                )}
              </div>
              {comment.userId === currentUser?.uid && (
                <button
                  onClick={handleDelete}
                  className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 transition-opacity flex-shrink-0 ml-2"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-700 break-words">
              {textParts.map((part, index) => {
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
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 mt-1 px-1">
            <span className="text-xs text-gray-500">
              {formatRelativeTime(comment.createdAt)}
            </span>
            {canReply && currentUser && (
              <button
                onClick={handleReplyClick}
                className="text-xs sm:text-sm text-gray-500 hover:text-primary-600 transition-colors flex items-center space-x-1"
              >
                <Reply className="w-3 h-3" />
                <span>Trả lời</span>
              </button>
            )}
            {currentUser && (
              <div className="flex items-center">
                <CommentReactions
                  reactions={comment.reactions}
                  onReact={handleReact}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {showReplyInput && canReply && (
        <form onSubmit={handleReplySubmit} className="mt-2 ml-8 sm:ml-11 flex items-center space-x-2">
          <Avatar
            src={currentUserInfo?.photoURL || null}
            alt={currentUserInfo?.displayName || currentUser?.displayName}
            size="sm"
            className="flex-shrink-0"
          />
          <div className="flex-1 flex items-center space-x-1 sm:space-x-2 min-w-0">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Trả lời ${comment.userName}...`}
              className="flex-1 min-w-0 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={replying}
              autoFocus
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!replyText.trim() || replying}
              className="rounded-full flex-shrink-0 p-1.5 sm:p-2"
            >
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <button
              type="button"
              onClick={() => {
                setShowReplyInput(false)
                setReplyText('')
              }}
              className="text-gray-500 hover:text-gray-700 text-sm px-2"
            >
              Hủy
            </button>
          </div>
        </form>
      )}
    </div>
  )
})

CommentItem.displayName = 'CommentItem'

const Comments = memo(({ post, onAddComment, onDeleteComment, onReactComment, onReplyComment }) => {
  const { currentUser } = useAuth()
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [alert, setAlert] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null })

  const comments = useMemo(() => post.comments || [], [post.comments])
  
  const organizedComments = useMemo(() => {
    const topLevel = comments.filter(c => !c.replyTo)
    const repliesMap = new Map()
    
    comments.forEach(comment => {
      if (comment.replyTo) {
        if (!repliesMap.has(comment.replyTo)) {
          repliesMap.set(comment.replyTo, [])
        }
        repliesMap.get(comment.replyTo).push(comment)
      }
    })
    
    return { topLevel, repliesMap }
  }, [comments])

  const displayComments = useMemo(() => {
    const toShow = showAll ? organizedComments.topLevel : organizedComments.topLevel.slice(-3)
    return toShow
  }, [showAll, organizedComments.topLevel])

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

  const handleReact = useCallback(async (commentId, emoji) => {
    if (onReactComment) {
      await onReactComment(post.id, commentId, emoji)
    }
  }, [onReactComment, post.id])

  const handleReply = useCallback(async (parentCommentId, replyText, replyToUserId, replyToUserName) => {
    if (onReplyComment) {
      return await onReplyComment(post.id, parentCommentId, replyText, replyToUserId, replyToUserName)
    }
    return { success: false, error: 'Reply function not available' }
  }, [onReplyComment, post.id])

  const renderCommentWithReplies = useCallback((comment, level = 0) => {
    const replies = organizedComments.repliesMap.get(comment.id) || []
    const replyToUser = comment.replyTo ? comments.find(c => c.id === comment.replyTo) : null
    const replyToUserInfo = replyToUser ? { userId: replyToUser.userId, userName: replyToUser.userName } : null

    return (
      <div key={comment.id}>
        <CommentItem
          comment={comment}
          currentUser={currentUser}
          onDelete={handleDelete}
          onReact={handleReact}
          onReply={handleReply}
          replyToUser={replyToUserInfo}
          level={level}
        />
        {replies.length > 0 && (
          <div className="mt-2">
            {replies.map((reply) => renderCommentWithReplies(reply, level + 1))}
          </div>
        )}
      </div>
    )
  }, [organizedComments.repliesMap, comments, currentUser, handleDelete, handleReact, handleReply])

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      {organizedComments.topLevel.length > 0 && (
        <div className="space-y-3 mb-4">
          {organizedComments.topLevel.length > 3 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Xem tất cả {organizedComments.topLevel.length} bình luận
            </button>
          )}
          {displayComments.map((comment) => renderCommentWithReplies(comment, 0))}
          {showAll && organizedComments.topLevel.length > 3 && (
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
        <div className="flex-1 flex items-center space-x-1 sm:space-x-2 min-w-0">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Viết bình luận..."
            className="flex-1 min-w-0 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={loading}
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!commentText.trim() || loading}
            className="rounded-full flex-shrink-0 p-1.5 sm:p-2"
          >
            <Send className="w-3 h-3 sm:w-4 sm:h-4" />
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

