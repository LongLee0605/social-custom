import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'

const userInfoCache = new Map()

export const useUserInfo = (userId) => {
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setUserInfo(null)
      setLoading(false)
      return
    }

    setLoading(true)

    const userDocRef = doc(db, 'users', userId)
    const unsubscribe = onSnapshot(
      userDocRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          const info = {
            displayName: data.displayName || 'Người dùng',
            photoURL: data.photoURL || null,
          }
          userInfoCache.set(userId, info)
          setUserInfo(info)
        } else {
          userInfoCache.delete(userId)
          setUserInfo(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching user info:', error)
        if (userInfoCache.has(userId)) {
          setUserInfo(userInfoCache.get(userId))
        } else {
          setUserInfo(null)
        }
        setLoading(false)
      }
    )

    if (userInfoCache.has(userId)) {
      setUserInfo(userInfoCache.get(userId))
      setLoading(false)
    }

    return () => unsubscribe()
  }, [userId])

  return userInfo
}

