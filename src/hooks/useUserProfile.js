import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { createNotification } from '../services/notificationService'

export const useUserProfile = (userId) => {
  const { currentUser } = useAuth()
  const [userProfile, setUserProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      setPostsLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId))
        if (userDoc.exists()) {
          const profileData = { id: userDoc.id, ...userDoc.data() }
          setUserProfile(profileData)
          setIsFollowing(profileData.followers?.includes(currentUser?.uid) || false)
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching profile:', error)
        setLoading(false)
      }
    }

    fetchProfile()

    let unsubscribe = null

    const setupPostsQuery = (useOrderBy = true, currentUnsubscribe = null) => {
      if (currentUnsubscribe) {
        currentUnsubscribe()
      }

      try {
        const q = useOrderBy
          ? query(
              collection(db, 'posts'),
              where('userId', '==', userId),
              orderBy('createdAt', 'desc')
            )
          : query(
              collection(db, 'posts'),
              where('userId', '==', userId)
            )

        return onSnapshot(
          q,
          (snapshot) => {
            const postsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            
            if (!useOrderBy) {
              postsData.sort((a, b) => {
                const aTime = a.createdAt?.toMillis?.() || (a.createdAt ? new Date(a.createdAt).getTime() : 0)
                const bTime = b.createdAt?.toMillis?.() || (b.createdAt ? new Date(b.createdAt).getTime() : 0)
                return bTime - aTime
              })
            }
            
            setPosts(postsData)
            setPostsLoading(false)
          },
          (error) => {
            console.error('Error fetching user posts:', error)
            if (error.code === 'permission-denied') {
              console.error('Firestore permission denied. Please configure Security Rules.')
              setPostsLoading(false)
            } else if (error.code === 'failed-precondition' && useOrderBy) {
              console.warn('Composite index not found. Fetching posts without orderBy and sorting client-side...')
              unsubscribe = setupPostsQuery(false, unsubscribe)
            } else {
              setPostsLoading(false)
            }
          }
        )
      } catch (error) {
        console.error('Error setting up posts query:', error)
        setPostsLoading(false)
        return null
      }
    }

    unsubscribe = setupPostsQuery(true)

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [userId, currentUser?.uid])

  const followUser = async () => {
    if (!currentUser || !userProfile) return

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        following: arrayUnion(userId),
      })

      await updateDoc(doc(db, 'users', userId), {
        followers: arrayUnion(currentUser.uid),
      })

      setIsFollowing(true)

      // Tạo notification cho người được follow
      if (userId !== currentUser.uid) {
        createNotification({
          userId: userId,
          type: 'follow',
          title: 'Có người theo dõi bạn',
          message: 'đã theo dõi bạn',
          link: `/profile/${currentUser.uid}`,
          relatedUserId: currentUser.uid,
        }).catch(console.error)
      }
    } catch (error) {
      console.error('Error following user:', error)
    }
  }

  const unfollowUser = async () => {
    if (!currentUser || !userProfile) return

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        following: arrayRemove(userId),
      })

      await updateDoc(doc(db, 'users', userId), {
        followers: arrayRemove(currentUser.uid),
      })

      setIsFollowing(false)
    } catch (error) {
      console.error('Error unfollowing user:', error)
    }
  }

  return {
    userProfile,
    posts,
    loading,
    postsLoading,
    isFollowing,
    followUser,
    unfollowUser,
  }
}

