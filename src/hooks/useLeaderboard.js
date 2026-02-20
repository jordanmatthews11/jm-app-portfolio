import { useState, useEffect } from 'react'
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db, firebaseError } from '../lib/firebase'

const COLLECTION = 'easterEggScores'
const TOP_N = 10

export function useLeaderboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(firebaseError ? new Error(firebaseError) : null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!db || firebaseError) {
      setLoading(false)
      return
    }
    const q = query(
      collection(db, COLLECTION),
      orderBy('score', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(TOP_N)
    )
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          score: d.data().score ?? 0,
          level: d.data().level ?? 1,
          playerName: d.data().playerName ?? '',
          createdAt: d.data().createdAt?.toMillis?.() ?? 0,
        }))
        setEntries(list)
        setError(null)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

  async function submitScore({ score, level, playerName = '' }) {
    if (!db) return Promise.reject(new Error('Database not available'))
    setSubmitting(true)
    try {
      await addDoc(collection(db, COLLECTION), {
        score: Number(score),
        level: Number(level),
        playerName: String(playerName).trim().slice(0, 30),
        createdAt: serverTimestamp(),
      })
    } finally {
      setSubmitting(false)
    }
  }

  return { entries, loading, error, submitting, submitScore }
}
