/** Public web config for project my-social-9bc6a (safe to embed in client bundle) */
const projectDefaults = {
  apiKey: 'AIzaSyBsLFd75ObytqGXfuucX2-ymWMETRN-vpc',
  authDomain: 'my-social-9bc6a.firebaseapp.com',
  projectId: 'my-social-9bc6a',
  messagingSenderId: '638387555080',
  appId: '1:638387555080:web:3926181f5cc2f59385babd',
  measurementId: 'G-JXPX7E16VB',
}

function envValue(key) {
  const v = import.meta.env[key]
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null
}

function getConfigValue(envKey, fallbackKey) {
  return envValue(envKey) ?? projectDefaults[fallbackKey] ?? null
}

export function getFirebaseConfig() {
  const config = {
    apiKey: getConfigValue('VITE_FIREBASE_API_KEY', 'apiKey'),
    authDomain: getConfigValue('VITE_FIREBASE_AUTH_DOMAIN', 'authDomain'),
    projectId: getConfigValue('VITE_FIREBASE_PROJECT_ID', 'projectId'),
    messagingSenderId: getConfigValue('VITE_FIREBASE_MESSAGING_SENDER_ID', 'messagingSenderId'),
    appId: getConfigValue('VITE_FIREBASE_APP_ID', 'appId'),
    measurementId: envValue('VITE_FIREBASE_MEASUREMENT_ID') ?? projectDefaults.measurementId,
  }

  const missing = Object.entries(config)
    .filter(([key, value]) => key !== 'measurementId' && !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase config: ${missing.join(', ')}. Set VITE_* in .env or see .env.example`
    )
  }

  return config
}
