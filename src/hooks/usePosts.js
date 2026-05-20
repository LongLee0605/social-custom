import { useState, useEffect } from 'react'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { uploadImage } from '@/services/imageUpload'
import { createNotification } from '@/services/notificationService'
import {
  subscribeAllPosts,
  subscribeFollowingPosts,
  createPost as createPostDoc,
  getPost,
  updatePost,
  addPostComment,
  updatePostCommentsArray,
} from '@/repositories/postsRepository'
import { getUser } from '@/repositories/usersRepository'
import {
  validateImageFile,
  validatePostContent,
  validateCommentText,
  sanitizeFileName,
  MAX_REPLY_DEPTH,
} from '@/lib/validation'

export const usePostActions = () => {
  const { currentUser, userProfile } = useAuth()

  const createPost = async ({ content, image }) => {
    if (!currentUser) {
      return { success: false, error: 'Bạn cần đăng nhập để đăng bài viết' }
    }

    try {
      let imageURL = null

      if (image) {
        const validation = validateImageFile(image)
        if (!validation.valid) return { success: false, error: validation.error }

        const imagePath = `posts/${currentUser.uid}/${Date.now()}_${sanitizeFileName(image.name)}`
        imageURL = await uploadImage(image, imagePath)
      }

      const contentCheck = validatePostContent(content, !!imageURL)
      if (!contentCheck.valid) return { success: false, error: contentCheck.error }

      const postDocRef = await createPostDoc({
        userId: currentUser.uid,
        userName: userProfile?.displayName || currentUser.displayName || 'Người dùng',
        userPhotoURL: userProfile?.photoURL || currentUser.photoURL || '',
        content: content?.trim() || '',
        imageURL: imageURL || null,
      })

      try {
        const userData = await getUser(currentUser.uid)
        const followers = userData?.followers || []
        await Promise.all(
          followers.map((followerId) =>
            createNotification({
              userId: followerId,
              type: 'new_post',
              title: 'Người bạn theo dõi đã đăng bài mới',
              message: 'đã đăng một bài viết mới',
              link: `/?postId=${postDocRef.id}`,
              relatedUserId: currentUser.uid,
              relatedPostId: postDocRef.id,
            }).catch(console.error)
          )
        )
      } catch (notificationError) {
        console.error('Error sending notifications to followers:', notificationError)
      }

      return { success: true }
    } catch (error) {
      console.error('Error creating post:', error)
      return {
        success: false,
        error: error.code === 'permission-denied'
          ? 'Bạn không có quyền đăng bài viết. Vui lòng kiểm tra Security Rules.'
          : error.message || 'Có lỗi xảy ra khi tạo bài viết',
      }
    }
  }

  const likePost = async (postId, isLiked) => {
    if (!currentUser) return { success: false, error: 'Bạn cần đăng nhập' }

    try {
      const postData = await getPost(postId)
      if (!postData) return { success: false, error: 'Bài viết không tồn tại' }

      const likes = postData.likes || []
      let updatedLikes
      if (isLiked) {
        updatedLikes = likes.filter((uid) => uid !== currentUser.uid)
      } else {
        updatedLikes = [...likes, currentUser.uid]
        if (postData.userId !== currentUser.uid) {
          createNotification({
            userId: postData.userId,
            type: 'like',
            title: 'Có người thích bài viết của bạn',
            message: 'đã thích bài viết của bạn',
            link: `/?postId=${postId}`,
            relatedUserId: currentUser.uid,
            relatedPostId: postId,
          }).catch(console.error)
        }
      }

      await updatePost(postId, { likes: updatedLikes })
      return { success: true }
    } catch (error) {
      console.error('Error liking post:', error)
      return { success: false, error: error.message }
    }
  }

  const addComment = async (postId, commentText, replyTo = null) => {
    if (!currentUser) return { success: false, error: 'Bạn cần đăng nhập' }
    const textCheck = validateCommentText(commentText)
    if (!textCheck.valid) return { success: false, error: textCheck.error }

    try {
      const postData = await getPost(postId)
      if (!postData) return { success: false, error: 'Bài viết không tồn tại' }

      const comments = postData.comments || []
      let level = 0
      if (replyTo) {
        const parent = comments.find((c) => c.id === replyTo)
        if (parent) {
          level = (parent.level || 0) + 1
          if (level > MAX_REPLY_DEPTH) {
            return { success: false, error: 'Không thể trả lời quá 3 tầng' }
          }
        }
      }

      const commentId = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      const newComment = {
        id: commentId,
        userId: currentUser.uid,
        userName: userProfile?.displayName || currentUser.displayName || 'Người dùng',
        userPhotoURL: userProfile?.photoURL || currentUser.photoURL || '',
        text: textCheck.value,
        createdAt: new Date().toISOString(),
        reactions: {},
        replyTo: replyTo || null,
        level,
      }

      await addPostComment(postId, newComment)
      await updatePostCommentsArray(postId, [...comments, newComment], (postData.commentCount || 0) + 1)

      if (postData.userId !== currentUser.uid && !replyTo) {
        createNotification({
          userId: postData.userId,
          type: 'comment',
          title: 'Có người bình luận bài viết của bạn',
          message: 'đã bình luận bài viết của bạn',
          link: `/?postId=${postId}`,
          relatedUserId: currentUser.uid,
          relatedPostId: postId,
        }).catch(console.error)
      }

      return { success: true }
    } catch (error) {
      console.error('Error adding comment:', error)
      return { success: false, error: error.message }
    }
  }

  const replyComment = async (postId, parentCommentId, replyText, replyToUserId, replyToUserName) => {
    if (!currentUser) return { success: false, error: 'Bạn cần đăng nhập' }
    const textCheck = validateCommentText(replyText)
    if (!textCheck.valid) return { success: false, error: textCheck.error }

    try {
      const postData = await getPost(postId)
      if (!postData) return { success: false, error: 'Bài viết không tồn tại' }

      const comments = postData.comments || []
      const parentComment = comments.find((c) => c.id === parentCommentId)
      if (!parentComment) return { success: false, error: 'Bình luận không tồn tại' }

      const level = (parentComment.level || 0) + 1
      const commentId = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      const newReply = {
        id: commentId,
        userId: currentUser.uid,
        userName: userProfile?.displayName || currentUser.displayName || 'Người dùng',
        userPhotoURL: userProfile?.photoURL || currentUser.photoURL || '',
        text: `@${replyToUserName} ${textCheck.value}`,
        createdAt: new Date().toISOString(),
        reactions: {},
        replyTo: parentCommentId,
        level,
      }

      await addPostComment(postId, newReply)
      await updatePostCommentsArray(postId, [...comments, newReply], (postData.commentCount || 0) + 1)

      if (replyToUserId !== currentUser.uid) {
        createNotification({
          userId: replyToUserId,
          type: 'comment',
          title: 'Có người trả lời bình luận của bạn',
          message: 'đã trả lời bình luận của bạn',
          link: `/?postId=${postId}`,
          relatedUserId: currentUser.uid,
          relatedPostId: postId,
        }).catch(console.error)
      }

      return { success: true }
    } catch (error) {
      console.error('Error replying to comment:', error)
      return { success: false, error: error.message }
    }
  }

  const reactToComment = async (postId, commentId, emoji) => {
    if (!currentUser) return { success: false, error: 'Bạn cần đăng nhập' }

    try {
      const postData = await getPost(postId)
      if (!postData) return { success: false, error: 'Bài viết không tồn tại' }

      const comments = postData.comments || []
      const commentIndex = comments.findIndex((c) => c.id === commentId)
      if (commentIndex === -1) return { success: false, error: 'Bình luận không tồn tại' }

      const comment = comments[commentIndex]
      const reactions = { ...(comment.reactions || {}) }

      if (!reactions[emoji]) reactions[emoji] = []
      const userIds = reactions[emoji]
      const userIndex = userIds.indexOf(currentUser.uid)

      if (userIndex > -1) {
        userIds.splice(userIndex, 1)
        if (userIds.length === 0) delete reactions[emoji]
      } else {
        Object.keys(reactions).forEach((key) => {
          const index = reactions[key].indexOf(currentUser.uid)
          if (index > -1) {
            reactions[key].splice(index, 1)
            if (reactions[key].length === 0) delete reactions[key]
          }
        })
        reactions[emoji] = [...userIds, currentUser.uid]
      }

      const updatedComments = [...comments]
      updatedComments[commentIndex] = { ...comment, reactions: { ...reactions } }
      await updatePostCommentsArray(postId, updatedComments, postData.commentCount)

      return { success: true }
    } catch (error) {
      console.error('Error reacting to comment:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteComment = async (postId, commentId) => {
    if (!currentUser) return { success: false, error: 'Bạn cần đăng nhập' }

    try {
      const postData = await getPost(postId)
      if (!postData) return { success: false, error: 'Bài viết không tồn tại' }

      const comments = postData.comments || []
      const comment = comments.find((c) => c.id === commentId)
      if (!comment) return { success: false, error: 'Bình luận không tồn tại' }
      if (comment.userId !== currentUser.uid) {
        return { success: false, error: 'Bạn không có quyền xóa bình luận này' }
      }

      const deleteCommentAndReplies = (id, allComments) => {
        const toDelete = [id]
        const findReplies = (parentId) => {
          allComments.forEach((c) => {
            if (c.replyTo === parentId) {
              toDelete.push(c.id)
              findReplies(c.id)
            }
          })
        }
        findReplies(id)
        return toDelete
      }

      const idsToDelete = deleteCommentAndReplies(commentId, comments)
      const updatedComments = comments.filter((c) => !idsToDelete.includes(c.id))
      await updatePostCommentsArray(
        postId,
        updatedComments,
        Math.max(0, (postData.commentCount || 0) - idsToDelete.length)
      )

      for (const id of idsToDelete) {
        try {
          await deleteDoc(doc(db, 'posts', postId, 'comments', id))
        } catch {
          /* subcollection doc may not exist for legacy comments */
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting comment:', error)
      return { success: false, error: error.message }
    }
  }

  const deletePost = async (postId) => {
    if (!currentUser) return { success: false, error: 'Bạn cần đăng nhập' }
    try {
      const postData = await getPost(postId)
      if (!postData) return { success: false, error: 'Bài viết không tồn tại' }
      if (postData.userId !== currentUser.uid) {
        return { success: false, error: 'Bạn không có quyền xóa bài viết này' }
      }
      await deleteDoc(doc(db, 'posts', postId))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return {
    createPost,
    likePost,
    addComment,
    deleteComment,
    reactToComment,
    replyComment,
    deletePost,
  }
}

export const usePosts = (filterByFollowing = false) => {
  const { currentUser } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const actions = usePostActions()

  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      setPosts([])
      return undefined
    }

    setLoading(true)
    const onError = (error) => {
      console.error('Error fetching posts:', error)
      setLoading(false)
    }

    if (filterByFollowing) {
      let cancelled = false
      let unsubFollowing = () => {}
      getUser(currentUser.uid)
        .then((userData) => {
          if (cancelled) return
          const following = userData?.following || []
          unsubFollowing = subscribeFollowingPosts(
            following,
            currentUser.uid,
            (data) => {
              if (!cancelled) {
                setPosts(data)
                setLoading(false)
              }
            },
            onError
          )
        })
        .catch(onError)
      return () => {
        cancelled = true
        unsubFollowing()
      }
    }

    return subscribeAllPosts((data) => {
      setPosts(data)
      setLoading(false)
    }, onError)
  }, [currentUser, filterByFollowing])

  return { posts, loading, ...actions }
}
