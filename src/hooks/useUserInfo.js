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
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data()
          const info = {
            displayName: data.displayName || 'Người dùng',
            photoURL: data.photoURL || null,
          }
          const cachedInfo = userInfoCache.get(userId)
          
          if (!cachedInfo || cachedInfo.photoURL !== info.photoURL || cachedInfo.displayName !== info.displayName) {
            userInfoCache.set(userId, info)
            setUserInfo(info)
          } else if (cachedInfo) {
            setUserInfo(cachedInfo)
          } else {
            setUserInfo(info)
          }
        } else {
          userInfoCache.delete(userId)
          setUserInfo(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching user info:', error)
        const cachedInfo = userInfoCache.get(userId)
        if (cachedInfo) {
          setUserInfo(cachedInfo)
        } else {
          setUserInfo(null)
        }
        setLoading(false)
      }
    )

    const cachedInfo = userInfoCache.get(userId)
    if (cachedInfo) {
      setUserInfo(cachedInfo)
      setLoading(false)
    }

    return () => unsubscribe()
  }, [userId])

  return userInfo
}

export const clearUserInfoCache = (userId) => {
  if (userId) {
    userInfoCache.delete(userId)
  } else {
    userInfoCache.clear()
  }
}

