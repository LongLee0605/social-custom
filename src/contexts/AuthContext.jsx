import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      if (!user) {
        return { success: false, error: 'Không thể lấy thông tin người dùng' }
      }

      try {
        const userDocRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userDocRef)

        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            displayName: user.displayName || 'Người dùng',
            email: user.email || '',
            photoURL: user.photoURL || '',
            createdAt: new Date().toISOString(),
            bio: '',
            followers: [],
            following: [],
            posts: [],
          })
        } else {
          const existingData = userDoc.data()
          if (!existingData.photoURL && user.photoURL) {
            await updateDoc(userDocRef, {
              photoURL: user.photoURL,
            })
          }
        }

        await fetchUserProfile(user.uid)

        return { success: true }
      } catch (dbError) {
        console.error('Error with Firestore:', dbError)
        return { 
          success: true, 
          warning: 'Đăng nhập thành công nhưng không thể kết nối với database. Vui lòng kiểm tra cấu hình Firestore.' 
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

  const fetchUserProfile = async (uid) => {
    try {
      const userDocRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userDocRef)
      
      if (userDoc.exists()) {
        setUserProfile({ id: userDoc.id, ...userDoc.data() })
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        await fetchUserProfile(user.uid)
        try {
          const userDocRef = doc(db, 'users', user.uid)
          const userDoc = await getDoc(userDocRef)
          if (userDoc.exists()) {
            const existingData = userDoc.data()
            const updateData = {
              isOnline: true,
              lastSeen: serverTimestamp(),
            }
            if (!existingData.photoURL && user.photoURL) {
              updateData.photoURL = user.photoURL
            }
            await updateDoc(userDocRef, updateData)
          } else {
            await setDoc(userDocRef, {
              uid: user.uid,
              displayName: user.displayName || 'Người dùng',
              email: user.email || '',
              photoURL: user.photoURL || '',
              createdAt: serverTimestamp(),
              bio: '',
              followers: [],
              following: [],
              posts: [],
              isOnline: true,
              lastSeen: serverTimestamp(),
            }, { merge: true })
          }
        } catch (error) {
          console.error('Error setting online status:', error)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    const handleBeforeUnload = async () => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid)
          const userDoc = await getDoc(userDocRef)
          if (userDoc.exists()) {
            await updateDoc(userDocRef, {
              isOnline: false,
              lastSeen: serverTimestamp(),
            })
          }
        } catch (error) {
          console.error('Error setting offline status:', error)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      unsubscribe()
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid)
        getDoc(userDocRef).then((userDoc) => {
          if (userDoc.exists()) {
            updateDoc(userDocRef, {
              isOnline: false,
              lastSeen: serverTimestamp(),
            }).catch(console.error)
          }
        }).catch(console.error)
      }
    }
  }, [currentUser])

  const value = {
    currentUser,
    userProfile,
    signInWithGoogle,
    logout,
    loading,
    fetchUserProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

