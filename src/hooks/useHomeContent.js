import { useState, useEffect } from 'react'
import {
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db, firebaseError } from '../lib/firebase'

const DOC_PATH = 'homeContent/main'
const LOAD_TIMEOUT_MS = 10_000

const DEFAULT_CONTENT = {
  hero: {
    title: "Hey, I'm Jordan",
    tagline: "Builder of vibe-coded apps and small experiments.",
  },
  about: {
    heading: "About",
    bio: "This is my hub—where I keep my portfolio of projects and, eventually, some tools.\n\nEverything here is made with a mix of curiosity and good vibes.",
  },
  updates: [],
  blog: [],
  recentProjects: [],
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function useHomeContent() {
  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(firebaseError ? new Error(firebaseError) : null)

  useEffect(() => {
    if (!db || firebaseError) {
      setLoading(false)
      return
    }
    let done = false
    function finish() {
      if (done) return
      done = true
      setLoading(false)
    }
    const timeoutId = setTimeout(() => {
      if (done) return
      setError(
        new Error(
          "Firestore didn't respond. Create a Firestore database in Firebase Console (Build → Firestore Database → Create database), choose a region, then go to Rules and paste the rules from your project's firestore.rules file and Publish."
        )
      )
      setContent(DEFAULT_CONTENT)
      finish()
    }, LOAD_TIMEOUT_MS)
    const unsubscribe = onSnapshot(
      doc(db, DOC_PATH),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setContent({
            hero: data.hero || DEFAULT_CONTENT.hero,
            about: data.about || DEFAULT_CONTENT.about,
            updates: Array.isArray(data.updates) ? data.updates : [],
            blog: Array.isArray(data.blog) ? data.blog : [],
            recentProjects: Array.isArray(data.recentProjects) ? data.recentProjects : [],
          })
        } else {
          setContent(DEFAULT_CONTENT)
        }
        setError(null)
        finish()
      },
      (err) => {
        setError(err)
        finish()
      }
    )
    return () => {
      clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [])

  async function ensureDoc() {
    if (!db) return
    const docRef = doc(db, DOC_PATH)
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) {
      await setDoc(docRef, {
        ...DEFAULT_CONTENT,
        updatedAt: serverTimestamp(),
      })
    }
  }

  async function updateContent(field, value) {
    if (!db) return
    await ensureDoc()
    const docRef = doc(db, DOC_PATH)
    await updateDoc(docRef, {
      [field]: value,
      updatedAt: serverTimestamp(),
    })
  }

  async function addUpdate(update) {
    if (!db) return
    await ensureDoc()
    const docRef = doc(db, DOC_PATH)
    const newUpdate = { ...update, id: generateId() }
    const current = content.updates || []
    const updated = [...current, newUpdate].sort((a, b) => {
      const dateA = new Date(a.date || 0)
      const dateB = new Date(b.date || 0)
      return dateB - dateA
    })
    await updateDoc(docRef, {
      updates: updated,
      updatedAt: serverTimestamp(),
    })
  }

  async function updateUpdate(id, update) {
    if (!db) return
    const docRef = doc(db, DOC_PATH)
    const current = content.updates || []
    const updated = current.map((u) => (u.id === id ? { ...u, ...update } : u)).sort((a, b) => {
      const dateA = new Date(a.date || 0)
      const dateB = new Date(b.date || 0)
      return dateB - dateA
    })
    await updateDoc(docRef, {
      updates: updated,
      updatedAt: serverTimestamp(),
    })
  }

  async function removeUpdate(id) {
    if (!db) return
    const docRef = doc(db, DOC_PATH)
    const current = content.updates || []
    const updated = current.filter((u) => u.id !== id)
    await updateDoc(docRef, {
      updates: updated,
      updatedAt: serverTimestamp(),
    })
  }

  async function addBlogPost(post) {
    if (!db) return
    await ensureDoc()
    const docRef = doc(db, DOC_PATH)
    const newPost = { ...post, id: generateId() }
    const current = content.blog || []
    const updated = [...current, newPost].sort((a, b) => {
      const dateA = new Date(a.date || 0)
      const dateB = new Date(b.date || 0)
      return dateB - dateA
    })
    await updateDoc(docRef, {
      blog: updated,
      updatedAt: serverTimestamp(),
    })
  }

  async function updateBlogPost(id, post) {
    if (!db) return
    const docRef = doc(db, DOC_PATH)
    const current = content.blog || []
    const updated = current.map((p) => (p.id === id ? { ...p, ...post } : p)).sort((a, b) => {
      const dateA = new Date(a.date || 0)
      const dateB = new Date(b.date || 0)
      return dateB - dateA
    })
    await updateDoc(docRef, {
      blog: updated,
      updatedAt: serverTimestamp(),
    })
  }

  async function removeBlogPost(id) {
    if (!db) return
    const docRef = doc(db, DOC_PATH)
    const current = content.blog || []
    const updated = current.filter((p) => p.id !== id)
    await updateDoc(docRef, {
      blog: updated,
      updatedAt: serverTimestamp(),
    })
  }

  async function addRecentProject(project) {
    if (!db) return
    await ensureDoc()
    const docRef = doc(db, DOC_PATH)
    const newProject = { ...project, id: generateId() }
    const current = content.recentProjects || []
    const updated = [...current, newProject]
    await updateDoc(docRef, {
      recentProjects: updated,
      updatedAt: serverTimestamp(),
    })
  }

  async function updateRecentProject(id, project) {
    if (!db) return
    const docRef = doc(db, DOC_PATH)
    const current = content.recentProjects || []
    const updated = current.map((p) => (p.id === id ? { ...p, ...project } : p))
    await updateDoc(docRef, {
      recentProjects: updated,
      updatedAt: serverTimestamp(),
    })
  }

  async function removeRecentProject(id) {
    if (!db) return
    const docRef = doc(db, DOC_PATH)
    const current = content.recentProjects || []
    const updated = current.filter((p) => p.id !== id)
    await updateDoc(docRef, {
      recentProjects: updated,
      updatedAt: serverTimestamp(),
    })
  }

  return {
    content,
    loading,
    error,
    updateContent,
    addUpdate,
    updateUpdate,
    removeUpdate,
    addBlogPost,
    updateBlogPost,
    removeBlogPost,
    addRecentProject,
    updateRecentProject,
    removeRecentProject,
  }
}
