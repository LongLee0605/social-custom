import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { getUser, upsertUser, updateUser } from '@/repositories/usersRepository'
import { normalizeDisplayName } from '@/lib/constants'
import { serverTimestamp } from 'firebase/firestore'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState(null)
  const currentUserRef = useRef(null)

  useEffect(() => {
    currentUserRef.current = currentUser
  }, [currentUser])

  const fetchUserProfile = async (uid) => {
    try {
      const data = await getUser(uid)
      if (data) {
        setUserProfile(data)
        setProfileError(null)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setProfileError(error.message)
    }
  }

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      if (!user) {
        return { success: false, error: 'Không thể lấy thông tin người dùng' }
      }

      try {
        const existing = await getUser(user.uid)
        if (!existing) {
          await upsertUser(user.uid, {
            uid: user.uid,
            displayName: user.displayName || 'Người dùng',
            displayNameLower: normalizeDisplayName(user.displayName),
            email: user.email || '',
            photoURL: user.photoURL || '',
            createdAt: new Date().toISOString(),
            bio: '',
            followers: [],
            following: [],
            posts: [],
          })
        } else if (!existing.photoURL && user.photoURL) {
          await updateUser(user.uid, { photoURL: user.photoURL })
        }

        await fetchUserProfile(user.uid)
        return { success: true }
      } catch (dbError) {
        console.error('Error with Firestore:', dbError)
        return {
          success: false,
          error:
            'Đăng nhập thành công nhưng không thể đồng bộ hồ sơ. Vui lòng thử lại.',
          retry: true,
        }
      }
    } catch (error) {
      console.error('Error signing in with Google:', error)
      let errorMessage = 'Có lỗi xảy ra khi đăng nhập'
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Bạn đã đóng cửa sổ đăng nhập'
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Cửa sổ đăng nhập bị chặn. Vui lòng cho phép popup'
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'Domain chưa được cấu hình trong Firebase. Vui lòng thêm domain vào Firebase Console'
      } else if (error.message) {
        errorMessage = error.message
      }
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUserProfile(null)
      return { success: true }
    } catch (error) {
      console.error('Error signing out:', error)
      return { success: false, error: error.message }
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        await fetchUserProfile(user.uid)
        try {
          const existing = await getUser(user.uid)
          const updateData = {
            isOnline: true,
            lastSeen: serverTimestamp(),
          }
          if (!existing) {
            await upsertUser(user.uid, {
              uid: user.uid,
              displayName: user.displayName || 'Người dùng',
              displayNameLower: normalizeDisplayName(user.displayName),
              email: user.email || '',
              photoURL: user.photoURL || '',
              bio: '',
              followers: [],
              following: [],
              posts: [],
              isOnline: true,
              lastSeen: serverTimestamp(),
            })
          } else {
            if (!existing.photoURL && user.photoURL) {
              updateData.photoURL = user.photoURL
            }
            await updateUser(user.uid, updateData)
          }
        } catch (error) {
          console.error('Error setting online status:', error)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    const setOffline = async (uid) => {
      if (!uid) return
      try {
        await updateUser(uid, {
          isOnline: false,
          lastSeen: serverTimestamp(),
        })
      } catch (error) {
        console.error('Error setting offline status:', error)
      }
    }

    const handleBeforeUnload = () => {
      const uid = currentUserRef.current?.uid
      if (uid) setOffline(uid)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      unsubscribe()
      window.removeEventListener('beforeunload', handleBeforeUnload)
      const uid = currentUserRef.current?.uid
      if (uid) setOffline(uid)
    }
  }, [])

  const value = {
    currentUser,
    userProfile,
    profileError,
    signInWithGoogle,
    logout,
    loading,
    fetchUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
