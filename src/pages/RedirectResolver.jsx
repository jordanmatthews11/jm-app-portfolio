import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db, firebaseError } from '../lib/firebase'

export default function RedirectResolver({ slug }) {
  const [status, setStatus] = useState('loading') // 'loading' | 'found' | 'notfound' | 'error'

  useEffect(() => {
    if (!slug || !db) {
      setStatus('notfound')
      return
    }
    if (firebaseError) {
      setStatus('error')
      return
    }
    let cancelled = false
    getDoc(doc(db, 'redirects', slug))
      .then((snap) => {
        if (cancelled) return
        if (snap.exists() && snap.data().url) {
          setStatus('found')
          window.location.replace(snap.data().url)
        } else {
          setStatus('notfound')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => { cancelled = true }
  }, [slug])

  if (status === 'loading') {
    return (
      <div className="auth-loading">
        <span>Redirecting…</span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="auth-loading auth-denied">
        <p>Something went wrong.</p>
        <a href="/" className="btn btn-secondary">Go home</a>
      </div>
    )
  }

  return (
    <div className="auth-loading auth-denied">
      <p>Link not found.</p>
      <a href="/" className="btn btn-secondary">Go to jordan-matthews.com</a>
    </div>
  )
}
