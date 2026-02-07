import { useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db, firebaseError } from '../lib/firebase'

const COLLECTION = 'portfolio'
const LOAD_TIMEOUT_MS = 10_000

export function usePortfolio() {
  const [items, setItems] = useState([])
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
      setItems([])
      finish()
    }, LOAD_TIMEOUT_MS)
    const unsubscribe = onSnapshot(
      collection(db, COLLECTION),
      (snapshot) => {
        const docs = snapshot.docs.map((d) => {
          const data = d.data()
          const createdAt = data.createdAt?.toMillis?.() ?? data.createdAt?.toDate?.()?.getTime?.() ?? 0
          return { id: d.id, ...data, createdAt }
        })
        docs.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
        setItems(docs)
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

  async function addItem({ title, url, description = '', tags = [], image = '' }) {
    if (!db) return
    const ref = await addDoc(collection(db, COLLECTION), {
      title,
      url,
      description: description.trim(),
      tags: Array.isArray(tags) ? tags : (tags && String(tags).split(',').map((t) => t.trim()).filter(Boolean)) || [],
      image: (image && image.trim()) || '',
      createdAt: serverTimestamp(),
    })
    return ref.id
  }

  async function updateItem(id, { title, url, description, tags, image }) {
    if (!db) return
    const payload = {}
    if (title !== undefined) payload.title = title
    if (url !== undefined) payload.url = url
    if (description !== undefined) payload.description = description
    if (tags !== undefined) payload.tags = Array.isArray(tags) ? tags : (String(tags).split(',').map((t) => t.trim()).filter(Boolean))
    if (image !== undefined) payload.image = image
    await updateDoc(doc(db, COLLECTION, id), payload)
  }

  async function removeItem(id) {
    if (!db) return
    await deleteDoc(doc(db, COLLECTION, id))
  }

  return { items, loading, error, addItem, updateItem, removeItem }
}
