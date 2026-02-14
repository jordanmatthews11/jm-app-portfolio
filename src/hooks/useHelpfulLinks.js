import { useState, useEffect } from 'react'
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db, firebaseError } from '../lib/firebase'

const DOC_PATH = 'homeContent/helpfulLinks'
const LOAD_TIMEOUT_MS = 10_000

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

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
      doc(db, DOC_PATH),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          const list = Array.isArray(data.items) ? data.items : []
          list.sort((a, b) => {
            const orderA = typeof a.order === 'number' ? a.order : 9999
            const orderB = typeof b.order === 'number' ? b.order : 9999
            return orderA - orderB
          })
          setItems(list)
        } else {
          setItems([])
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

  async function saveItems(newItems) {
    if (!db) return
    const docRef = doc(db, DOC_PATH)
    await setDoc(docRef, { items: newItems, updatedAt: serverTimestamp() }, { merge: true })
  }

  async function addLink({ title, url, description = '' }) {
    const newItem = {
      id: generateId(),
      title: title.trim(),
      url: url.trim(),
      description: (description || '').trim(),
      order: items.length,
    }
    await saveItems([...items, newItem])
  }

  async function updateLink(id, { title, url, description }) {
    const updated = items.map((item) => {
      if (item.id !== id) return item
      const copy = { ...item }
      if (title !== undefined) copy.title = title.trim()
      if (url !== undefined) copy.url = url.trim()
      if (description !== undefined) copy.description = description.trim()
      return copy
    })
    await saveItems(updated)
  }

  async function removeLink(id) {
    const filtered = items.filter((item) => item.id !== id)
    await saveItems(filtered)
  }

  async function moveLink(index, direction) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= items.length) return
    const newItems = [...items]
    const orderA = typeof newItems[index].order === 'number' ? newItems[index].order : index
    const orderB = typeof newItems[targetIndex].order === 'number' ? newItems[targetIndex].order : targetIndex
    newItems[index] = { ...newItems[index], order: orderB }
    newItems[targetIndex] = { ...newItems[targetIndex], order: orderA }
    await saveItems(newItems)
  }

  return { items, loading, error, addLink, updateLink, removeLink, moveLink }
}
