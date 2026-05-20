import { useState, useEffect } from 'react'
import { subscribePostComments } from '@/repositories/postsRepository'

/** Merge embedded comments (legacy) with subcollection comments */
function mergeComments(embedded = [], fromSubcollection = []) {
  const byId = new Map()
  embedded.forEach((c) => {
    if (c?.id) byId.set(c.id, c)
  })
  fromSubcollection.forEach((c) => {
    if (c?.id) byId.set(c.id, c)
  })
  return Array.from(byId.values()).sort((a, b) => {
    const ta = new Date(a.createdAt?.toDate?.() ?? a.createdAt ?? 0).getTime()
    const tb = new Date(b.createdAt?.toDate?.() ?? b.createdAt ?? 0).getTime()
    return ta - tb
  })
}

export const usePostComments = (postId, embeddedComments = []) => {
  const [subComments, setSubComments] = useState([])

  useEffect(() => {
    if (!postId) return undefined
    return subscribePostComments(
      postId,
      setSubComments,
      (err) => console.error('Error subscribing comments:', err)
    )
  }, [postId])

  return mergeComments(embeddedComments, subComments)
}
