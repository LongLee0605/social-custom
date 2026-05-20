import {
  collection,
  doc,
  query,
  orderBy,
  where,
  onSnapshot,
  addDoc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { FIRESTORE_IN_QUERY_LIMIT } from '@/lib/constants'

const postsCol = () => collection(db, 'posts')

export function subscribeAllPosts(callback, onError) {
  const q = query(postsCol(), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
  }, onError)
}

export async function fetchPostsByUserIds(userIds, maxPerChunk = FIRESTORE_IN_QUERY_LIMIT) {
  if (!userIds?.length) return []
  const chunks = []
  for (let i = 0; i < userIds.length; i += maxPerChunk) {
    chunks.push(userIds.slice(i, i + maxPerChunk))
  }
  const allPosts = []
  for (const chunk of chunks) {
    const q = query(
      postsCol(),
      where('userId', 'in', chunk),
      orderBy('createdAt', 'desc')
    )
    const snap = await getDocs(q)
    allPosts.push(...snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  }
  return allPosts.sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? a.createdAt?.seconds ?? 0
    const tb = b.createdAt?.toMillis?.() ?? b.createdAt?.seconds ?? 0
    return tb - ta
  })
}

export function subscribeFollowingPosts(followingIds, currentUserId, callback, onError) {
  const ids = [...new Set([currentUserId, ...(followingIds || [])])]
  if (!ids.length) {
    callback([])
    return () => {}
  }

  let cancelled = false
  const refresh = async () => {
    try {
      const posts = await fetchPostsByUserIds(ids)
      if (!cancelled) callback(posts)
    } catch (err) {
      onError?.(err)
    }
  }
  refresh()
  const interval = setInterval(refresh, 30000)
  return () => {
    cancelled = true
    clearInterval(interval)
  }
}

export async function createPost(data) {
  return addDoc(postsCol(), {
    ...data,
    likes: [],
    comments: [],
    commentCount: 0,
    visibility: 'public',
    createdAt: serverTimestamp(),
  })
}

export async function getPost(postId) {
  const snap = await getDoc(doc(db, 'posts', postId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updatePost(postId, data) {
  return updateDoc(doc(db, 'posts', postId), data)
}

export async function deletePost(postId) {
  return deleteDoc(doc(db, 'posts', postId))
}

export function subscribePostComments(postId, callback, onError) {
  const q = query(
    collection(db, 'posts', postId, 'comments'),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  )
}

export async function addPostComment(postId, commentData) {
  const commentRef = doc(db, 'posts', postId, 'comments', commentData.id)
  await setDoc(commentRef, {
    ...commentData,
    createdAt: serverTimestamp(),
  })
  const post = await getPost(postId)
  const count = (post?.commentCount ?? post?.comments?.length ?? 0) + 1
  await updatePost(postId, { commentCount: count })
  return commentRef
}

export async function updatePostCommentsArray(postId, comments, commentCount) {
  return updatePost(postId, { comments, commentCount })
}

export function subscribeUserPosts(userId, callback, onError) {
  const q = query(
    postsCol(),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  )
}
