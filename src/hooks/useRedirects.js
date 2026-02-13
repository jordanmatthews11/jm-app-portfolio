import { useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db, firebaseError } from '../lib/firebase'

const COLLECTION = 'redirects'
const LOAD_TIMEOUT_MS = 10_000

export const RESERVED_SLUGS = ['portfolio', 'tools', 'admin', 'go']

export function useRedirects() {
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
      setError(new Error("Firestore didn't respond."))
      setItems([])
      finish()
    }, LOAD_TIMEOUT_MS)
    const unsubscribe = onSnapshot(
      collection(db, COLLECTION),
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({
          id: d.id,
          slug: d.id,
          url: d.data().url || '',
          createdAt: d.data().createdAt?.toMillis?.() ?? 0,
        }))
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

  async function addRedirect(slug, url) {
    if (!db) return
    const normalized = slug.trim().replace(/\s+/g, '-')
    await setDoc(doc(db, COLLECTION, normalized), {
      url: url.trim(),
      createdAt: serverTimestamp(),
    })
  }

  async function updateRedirect(slug, url) {
    if (!db) return
    await updateDoc(doc(db, COLLECTION, slug), { url: url.trim() })
  }

  async function removeRedirect(slug) {
    if (!db) return
    await deleteDoc(doc(db, COLLECTION, slug))
  }

  return { items, loading, error, addRedirect, updateRedirect, removeRedirect }
}
