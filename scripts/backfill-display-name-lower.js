/**
 * Backfill users.displayNameLower for prefix search.
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=... node scripts/backfill-display-name-lower.js
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function normalize(name) {
  return (name || '').trim().toLowerCase()
}

async function run() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('Set GOOGLE_APPLICATION_CREDENTIALS')
    process.exit(1)
  }
  initializeApp({ credential: applicationDefault() })
  const db = getFirestore()
  const snap = await db.collection('users').get()
  let updated = 0

  for (const docSnap of snap.docs) {
    const data = docSnap.data()
    const lower = normalize(data.displayName)
    if (data.displayNameLower === lower) continue
    await docSnap.ref.update({ displayNameLower: lower })
    updated++
  }

  console.log(`Updated ${updated} / ${snap.size} users`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
