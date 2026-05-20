const requiredEnvKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

const devFallback = import.meta.env.DEV
  ? {
      apiKey: 'AIzaSyBsLFd75ObytqGXfuucX2-ymWMETRN-vpc',
      authDomain: 'my-social-9bc6a.firebaseapp.com',
      projectId: 'my-social-9bc6a',
      messagingSenderId: '638387555080',
      appId: '1:638387555080:web:3926181f5cc2f59385babd',
      measurementId: 'G-JXPX7E16VB',
    }
  : null

function getConfigValue(envKey, fallbackKey) {
  const value = import.meta.env[envKey]
  if (value) return value
  if (devFallback) return devFallback[fallbackKey]
  return null
}

export function getFirebaseConfig() {
  const config = {
    apiKey: getConfigValue('VITE_FIREBASE_API_KEY', 'apiKey'),
    authDomain: getConfigValue('VITE_FIREBASE_AUTH_DOMAIN', 'authDomain'),
    projectId: getConfigValue('VITE_FIREBASE_PROJECT_ID', 'projectId'),
    messagingSenderId: getConfigValue('VITE_FIREBASE_MESSAGING_SENDER_ID', 'messagingSenderId'),
    appId: getConfigValue('VITE_FIREBASE_APP_ID', 'appId'),
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || devFallback?.measurementId,
  }

  if (!import.meta.env.DEV) {
    const missing = requiredEnvKeys.filter((key) => !import.meta.env[key])
    if (missing.length > 0) {
      throw new Error(
        `Missing required Firebase environment variables: ${missing.join(', ')}. See .env.example`
      )
    }
  }

  return config
}
