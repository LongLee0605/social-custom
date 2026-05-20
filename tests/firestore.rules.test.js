import { readFileSync } from 'fs'
import { resolve } from 'path'
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing'
import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
} from 'firebase/firestore'

const PROJECT_ID = 'social-custom-rules-test'
const rules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8')

let testEnv

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: '127.0.0.1',
      port: 8080,
    },
  })
})

afterAll(async () => {
  await testEnv?.cleanup()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
})

const authedDb = (uid) => testEnv.authenticatedContext(uid).firestore()

describe('Firestore security rules', () => {
  it('allows owner to create and delete own post', async () => {
    const db = authedDb('user1')
    const postRef = doc(db, 'posts', 'post1')
    await assertSucceeds(
      setDoc(postRef, {
        userId: 'user1',
        userName: 'A',
        userPhotoURL: '',
        content: 'hi',
        imageURL: null,
        likes: [],
        comments: [],
        commentCount: 0,
        createdAt: new Date(),
      })
    )
    await assertSucceeds(deleteDoc(postRef))
  })

  it('denies non-owner deleting post', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'posts', 'post1'), {
        userId: 'user1',
        userName: 'A',
        userPhotoURL: '',
        content: 'hi',
        imageURL: null,
        likes: [],
        comments: [],
        commentCount: 0,
        createdAt: new Date(),
      })
    })
    await assertFails(deleteDoc(doc(authedDb('user2'), 'posts', 'post1')))
  })

  it('requires actorId on notification create', async () => {
    const db = authedDb('user1')
    await assertFails(
      addDoc(collection(db, 'notifications'), {
        userId: 'user2',
        type: 'like',
        title: 't',
        message: 'm',
        read: false,
        createdAt: new Date(),
      })
    )
    await assertSucceeds(
      addDoc(collection(db, 'notifications'), {
        userId: 'user2',
        actorId: 'user1',
        type: 'like',
        title: 't',
        message: 'm',
        read: false,
        createdAt: new Date(),
      })
    )
  })

  it('restricts chat updates to allowed fields', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore()
      await setDoc(doc(db, 'chats', 'chat1'), {
        participants: ['user1', 'user2'],
        lastMessage: '',
        unreadCount: { user1: 0, user2: 0 },
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    })
    const db = authedDb('user1')
    await assertSucceeds(
      updateDoc(doc(db, 'chats', 'chat1'), {
        lastMessage: 'hello',
        updatedAt: new Date(),
      })
    )
    await assertFails(
      updateDoc(doc(db, 'chats', 'chat1'), {
        participants: ['user1', 'user3'],
      })
    )
  })

  it('denies unauthenticated reads', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users', 'user1'), {
        uid: 'user1',
        displayName: 'A',
        email: 'a@test.com',
        followers: [],
        following: [],
      })
    })
    const unauthed = testEnv.unauthenticatedContext().firestore()
    await assertFails(getDoc(doc(unauthed, 'users', 'user1')))
  })
})
