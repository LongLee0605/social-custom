import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { uploadImage } from '../services/imageUpload'
import { createNotification } from '../services/notificationService'

export const usePosts = (filterByFollowing = false) => {
  const { currentUser, userProfile } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser && filterByFollowing) {
      setLoading(false)
      return
    }

    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        let postsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Nếu filterByFollowing, chỉ hiển thị posts từ người đang follow + chính mình
        if (filterByFollowing && currentUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
            if (userDoc.exists()) {
              const userData = userDoc.data()
              const followingList = userData.following || []
              const allowedUserIds = [currentUser.uid, ...followingList]
              
              postsData = postsData.filter((post) => 
                allowedUserIds.includes(post.userId)
              )
            }
          } catch (error) {
            console.error('Error fetching following list:', error)
          }
        }

        setPosts(postsData)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching posts:', error)
        if (error.code === 'permission-denied') {
          console.error('Firestore permission denied. Please configure Security Rules.')
        }
        setLoading(false)
      }
    )

    return unsubscribe
  }, [currentUser, filterByFollowing])

  const createPost = async ({ content, image }) => {
    if (!currentUser) {
      return { success: false, error: 'Bạn cần đăng nhập để đăng bài viết' }
    }

    try {
      let imageURL = null

      if (image) {
        try {
          const maxSize = 10 * 1024 * 1024
          if (image.size > maxSize) {
            return { success: false, error: 'Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB' }
          }

          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
          if (!allowedTypes.includes(image.type)) {
            return { success: false, error: 'Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh JPG, PNG, GIF hoặc WebP' }
          }

          const sanitizedFileName = image.name.replace(/[^a-zA-Z0-9.-]/g, '_')
          const imagePath = `posts/${currentUser.uid}/${Date.now()}_${sanitizedFileName}`
          
          imageURL = await uploadImage(image, imagePath)
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError)
          
          let errorMessage = 'Lỗi khi upload ảnh'
          if (uploadError.message) {
            errorMessage = uploadError.message
          }
          
          return { success: false, error: errorMessage }
        }
      }

      if (!content?.trim() && !imageURL) {
        return { success: false, error: 'Vui lòng nhập nội dung hoặc chọn ảnh' }
      }

      await addDoc(collection(db, 'posts'), {
        userId: currentUser.uid,
        userName: userProfile?.displayName || currentUser.displayName || 'Người dùng',
        userPhotoURL: userProfile?.photoURL || currentUser.photoURL || '',
        content: content?.trim() || '',
        imageURL: imageURL || null,
        likes: [],
        comments: [],
        commentCount: 0,
        createdAt: serverTimestamp(),
      })

      return { success: true }
    } catch (error) {
      console.error('Error creating post:', error)
      let errorMessage = 'Có lỗi xảy ra khi tạo bài viết'
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Bạn không có quyền đăng bài viết. Vui lòng kiểm tra Security Rules.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const likePost = async (postId, isLiked) => {
    if (!currentUser) return { success: false, error: 'Bạn cần đăng nhập' }

    try {
      const postRef = doc(db, 'posts', postId)
      const postDoc = await getDoc(postRef)
      
      if (!postDoc.exists()) {
        return { success: false, error: 'Bài viết không tồn tại' }
      }

      const postData = postDoc.data()
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
          }).catch((error) => {
            console.error('Error creating like notification:', error)
          })
        }
      }

      await updateDoc(postRef, {
        likes: updatedLikes,
      })

      return { success: true }
    } catch (error) {
      console.error('Error liking post:', error)
      return { success: false, error: error.message }
    }
  }

  const addComment = async (postId, commentText, replyTo = null) => {
    if (!currentUser) return { success: false, error: 'Bạn cần đăng nhập' }
    if (!commentText?.trim()) return { success: false, error: 'Vui lòng nhập bình luận' }

    try {
      const postRef = doc(db, 'posts', postId)
      const postDoc = await getDoc(postRef)
      
      if (!postDoc.exists()) {
        return { success: false, error: 'Bài viết không tồn tại' }
      }

      const postData = postDoc.data()
      const comments = postData.comments || []

      let level = 0
      if (replyTo) {
        const parentComment = comments.find(c => c.id === replyTo)
        if (parentComment) {
          level = (parentComment.level || 0) + 1
          if (level > 2) {
            return { success: false, error: 'Không thể trả lời quá 3 tầng' }
          }
        }
      }

      const newComment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: currentUser.uid,
        userName: userProfile?.displayName || currentUser.displayName || 'Người dùng',
        userPhotoURL: userProfile?.photoURL || currentUser.photoURL || '',
        text: commentText.trim(),
        createdAt: new Date().toISOString(),
        reactions: {},
        replyTo: replyTo || null,
        level: level,
      }

      await updateDoc(postRef, {
        comments: [...comments, newComment],
        commentCount: (postData.commentCount || 0) + 1,
      })

      if (postData.userId !== currentUser.uid && !replyTo) {
        createNotification({
          userId: postData.userId,
          type: 'comment',
          title: 'Có người bình luận bài viết của bạn',
          message: 'đã bình luận bài viết của bạn',
          link: `/?postId=${postId}`,
          relatedUserId: currentUser.uid,
          relatedPostId: postId,
        }).catch((error) => {
          console.error('Error creating comment notification:', error)
        })
      }

      return { success: true }
    } catch (error) {
      console.error('Error adding comment:', error)
      return { success: false, error: error.message }
    }
  }

  const replyComment = async (postId, parentCommentId, replyText, replyToUserId, replyToUserName) => {
    if (!currentUser) return { success: false, error: 'Bạn cần đăng nhập' }
    if (!replyText?.trim()) return { success: false, error: 'Vui lòng nhập bình luận' }

    try {
      const postRef = doc(db, 'posts', postId)
      const postDoc = await getDoc(postRef)
      
      if (!postDoc.exists()) {
        return { success: false, error: 'Bài viết không tồn tại' }
      }

      const postData = postDoc.data()
      const comments = postData.comments || []
      const parentComment = comments.find(c => c.id === parentCommentId)

      if (!parentComment) {
        return { success: false, error: 'Bình luận không tồn tại' }
      }

      const level = (parentComment.level || 0) + 1
      if (level > 2) {
        return { success: false, error: 'Không thể trả lời quá 3 tầng' }
      }

      const newReply = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: currentUser.uid,
        userName: userProfile?.displayName || currentUser.displayName || 'Người dùng',
        userPhotoURL: userProfile?.photoURL || currentUser.photoURL || '',
        text: `@${replyToUserName} ${replyText.trim()}`,
        createdAt: new Date().toISOString(),
        reactions: {},
        replyTo: parentCommentId,
        level: level,
      }

      await updateDoc(postRef, {
        comments: [...comments, newReply],
        commentCount: (postData.commentCount || 0) + 1,
      })

      if (replyToUserId !== currentUser.uid) {
        createNotification({
          userId: replyToUserId,
          type: 'comment',
          title: 'Có người trả lời bình luận của bạn',
          message: 'đã trả lời bình luận của bạn',
          link: `/?postId=${postId}`,
          relatedUserId: currentUser.uid,
          relatedPostId: postId,
        }).catch((error) => {
          console.error('Error creating reply notification:', error)
        })
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
      const postRef = doc(db, 'posts', postId)
      const postDoc = await getDoc(postRef)
      
      if (!postDoc.exists()) {
        return { success: false, error: 'Bài viết không tồn tại' }
      }

      const postData = postDoc.data()
      const comments = postData.comments || []
      const commentIndex = comments.findIndex(c => c.id === commentId)

      if (commentIndex === -1) {
        return { success: false, error: 'Bình luận không tồn tại' }
      }

      const comment = comments[commentIndex]
      const reactions = comment.reactions || {}

      if (!reactions[emoji]) {
        reactions[emoji] = []
      }

      const userIds = reactions[emoji]
      const userIndex = userIds.indexOf(currentUser.uid)

      if (userIndex > -1) {
        userIds.splice(userIndex, 1)
        if (userIds.length === 0) {
          delete reactions[emoji]
        }
      } else {
        Object.keys(reactions).forEach((key) => {
          const index = reactions[key].indexOf(currentUser.uid)
          if (index > -1) {
            reactions[key].splice(index, 1)
            if (reactions[key].length === 0) {
              delete reactions[key]
            }
          }
        })
        reactions[emoji] = [...userIds, currentUser.uid]
      }

      const updatedComments = [...comments]
      updatedComments[commentIndex] = {
        ...comment,
        reactions: { ...reactions },
      }

      await updateDoc(postRef, {
        comments: updatedComments,
      })

      return { success: true }
    } catch (error) {
      console.error('Error reacting to comment:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteComment = async (postId, commentId) => {
    if (!currentUser) return { success: false, error: 'Bạn cần đăng nhập' }

    try {
      const postRef = doc(db, 'posts', postId)
      const postDoc = await getDoc(postRef)
      
      if (!postDoc.exists()) {
        return { success: false, error: 'Bài viết không tồn tại' }
      }

      const postData = postDoc.data()
      const comments = postData.comments || []
      const comment = comments.find((c) => c.id === commentId)

      if (!comment) {
        return { success: false, error: 'Bình luận không tồn tại' }
      }

      if (comment.userId !== currentUser.uid) {
        return { success: false, error: 'Bạn không có quyền xóa bình luận này' }
      }

      const deleteCommentAndReplies = (commentId, allComments) => {
        const toDelete = [commentId]
        const findReplies = (parentId) => {
          allComments.forEach(c => {
            if (c.replyTo === parentId) {
              toDelete.push(c.id)
              findReplies(c.id)
            }
          })
        }
        findReplies(commentId)
        return toDelete
      }

      const idsToDelete = deleteCommentAndReplies(commentId, comments)
      const updatedComments = comments.filter((c) => !idsToDelete.includes(c.id))

      await updateDoc(postRef, {
        comments: updatedComments,
        commentCount: Math.max(0, (postData.commentCount || 0) - idsToDelete.length),
      })

      return { success: true }
    } catch (error) {
      console.error('Error deleting comment:', error)
      return { success: false, error: error.message }
    }
  }

  return { posts, loading, createPost, likePost, addComment, deleteComment, reactToComment, replyComment }
}

