import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { auth, googleProvider, firebaseError } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (firebaseError || !auth) {
      setLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  async function signInWithGoogle() {
    if (!auth || !googleProvider) return
    await signInWithPopup(auth, googleProvider)
  }

  async function signOut() {
    if (!auth) return
    await firebaseSignOut(auth)
  }

  const allowedEmail = import.meta.env.VITE_ALLOWED_EMAIL
  const isAllowed = !allowedEmail || (user && user.email === allowedEmail)

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, isAllowed, allowedEmail, firebaseError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
