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

const COLLECTION = 'helpfulLinks'
const LOAD_TIMEOUT_MS = 10_000

export function useHelpfulLinks() {
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
        const docs = snapshot.docs.map((d) => {
          const data = d.data()
          const createdAt = data.createdAt?.toMillis?.() ?? data.createdAt?.toDate?.()?.getTime?.() ?? 0
          return { id: d.id, ...data, createdAt }
        })
        docs.sort((a, b) => {
          const orderA = typeof a.order === 'number' ? a.order : 9999
          const orderB = typeof b.order === 'number' ? b.order : 9999
          if (orderA !== orderB) return orderA - orderB
          return (b.createdAt ?? 0) - (a.createdAt ?? 0)
        })
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

  async function addLink({ title, url, description = '' }) {
    if (!db) return
    await addDoc(collection(db, COLLECTION), {
      title: title.trim(),
      url: url.trim(),
      description: (description || '').trim(),
      order: items.length,
      createdAt: serverTimestamp(),
    })
  }

  async function updateLink(id, { title, url, description }) {
    if (!db) return
    const payload = {}
    if (title !== undefined) payload.title = title.trim()
    if (url !== undefined) payload.url = url.trim()
    if (description !== undefined) payload.description = description.trim()
    await updateDoc(doc(db, COLLECTION, id), payload)
  }

  async function removeLink(id) {
    if (!db) return
    await deleteDoc(doc(db, COLLECTION, id))
  }

  async function moveLink(index, direction) {
    if (!db) return
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= items.length) return
    const itemA = items[index]
    const itemB = items[targetIndex]
    const orderA = typeof itemA.order === 'number' ? itemA.order : index
    const orderB = typeof itemB.order === 'number' ? itemB.order : targetIndex
    await Promise.all([
      updateDoc(doc(db, COLLECTION, itemA.id), { order: orderB }),
      updateDoc(doc(db, COLLECTION, itemB.id), { order: orderA }),
    ])
  }

  return { items, loading, error, addLink, updateLink, removeLink, moveLink }
}
