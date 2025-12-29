import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'

export const useOnlineStatus = (userId) => {
  const [isOnline, setIsOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState(null)

  useEffect(() => {
    if (!userId) return

    const userDocRef = doc(db, 'users', userId)
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      const data = doc.data()
      if (data) {
        setIsOnline(data.isOnline || false)
        setLastSeen(data.lastSeen || null)
      }
    })

    return unsubscribe
  }, [userId])

  return { isOnline, lastSeen }
}

