import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { getFirebaseConfig } from './config.js'

const firebaseConfig = getFirebaseConfig()
const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({
  prompt: 'select_account',
})

if (typeof window !== 'undefined' && import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  })
}

let analytics = null

if (typeof window !== 'undefined') {
  isSupported()
    .then((yes) => {
      if (yes) analytics = getAnalytics(app)
    })
    .catch(() => {})
}

export { analytics }
export default app
