import { useState, useEffect } from 'react'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, firebaseError } from '../lib/firebase'

const DOC_PATH = 'homeContent/resume'
const LOAD_TIMEOUT_MS = 10_000

export function useResume() {
  const [resume, setResume] = useState(null)
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
      finish()
    }, LOAD_TIMEOUT_MS)
    const unsubscribe = onSnapshot(
      doc(db, DOC_PATH),
      (snapshot) => {
        setResume(snapshot.exists() ? snapshot.data() : null)
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

  async function saveResume(data) {
    if (!db) return
    await setDoc(
      doc(db, DOC_PATH),
      { ...data, updatedAt: serverTimestamp() },
      { merge: true }
    )
  }

  return { resume, loading, error, saveResume }
}
