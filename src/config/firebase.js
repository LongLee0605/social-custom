import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getMessaging, getToken, onMessage, isSupported as isMessagingSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBsLFd75ObytqGXfuucX2-ymWMETRN-vpc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "my-social-9bc6a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "my-social-9bc6a",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "638387555080",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:638387555080:web:3926181f5cc2f59385babd",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-JXPX7E16VB"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({
  prompt: 'select_account'
})

let analytics = null
let messaging = null

if (typeof window !== 'undefined') {
  // Initialize Analytics
  isSupported()
    .then((yes) => {
      if (yes) {
        analytics = getAnalytics(app)
      }
    })
    .catch((err) => {
    })

  // Initialize Cloud Messaging
  isMessagingSupported()
    .then((yes) => {
      if (yes && 'serviceWorker' in navigator) {
        messaging = getMessaging(app)
      }
    })
    .catch((err) => {
      console.log('Firebase Cloud Messaging is not supported:', err)
    })
}

export { analytics, messaging }

export default app

