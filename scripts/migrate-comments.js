/**
 * Migrate embedded post.comments[] to posts/{id}/comments subcollection.
 *
 * Usage (requires Firebase Admin SDK credentials):
 *   GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json node scripts/migrate-comments.js
 *   node scripts/migrate-comments.js --dry-run
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const dryRun = process.argv.includes('--dry-run')

function initAdmin() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return initializeApp({ credential: applicationDefault() })
  }
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to run migration.')
  process.exit(1)
}

async function migrate() {
  initAdmin()
  const db = getFirestore()
  const postsSnap = await db.collection('posts').get()
  let migrated = 0
  let skipped = 0

  for (const postDoc of postsSnap.docs) {
    const data = postDoc.data()
    const comments = data.comments || []
    if (!comments.length) {
      skipped++
      continue
    }

    const subSnap = await postDoc.ref.collection('comments').limit(1).get()
    if (!subSnap.empty) {
      skipped++
      continue
    }

    if (dryRun) {
      console.log(`[dry-run] Would migrate ${comments.length} comments for post ${postDoc.id}`)
      migrated++
      continue
    }

    const batch = db.batch()
    for (const comment of comments) {
      if (!comment?.id) continue
      const ref = postDoc.ref.collection('comments').doc(comment.id)
      batch.set(ref, comment)
    }
    batch.update(postDoc.ref, {
      commentCount: data.commentCount ?? comments.length,
      comments: [],
    })
    await batch.commit()
    migrated++
    console.log(`Migrated post ${postDoc.id}`)
  }

  console.log(`Done. migrated=${migrated} skipped=${skipped} dryRun=${dryRun}`)
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
