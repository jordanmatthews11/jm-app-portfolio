import { useState, useEffect, useMemo } from 'react'
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db, firebaseError } from '../lib/firebase'

const LEADERBOARD_DOC = 'homeContent/easterEggLeaderboard'
const TOP_N = 10
const MAX_ENTRIES = 50
const LOCAL_STORAGE_KEY = 'easterEggLeaderboardLocal'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function toMillis(v) {
  if (v == null) return 0
  if (typeof v.toMillis === 'function') return v.toMillis()
  if (typeof v === 'number') return v
  return 0
}

function loadLocalEntries() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveLocalEntry(entry) {
  const list = loadLocalEntries()
  list.push({
    id: entry.id,
    score: entry.score,
    level: entry.level,
    playerName: entry.playerName,
    createdAt: Date.now(),
  })
  // Keep last 20 local entries
  const trimmed = list.slice(-20)
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmed))
}

export function useLeaderboard() {
  const [firestoreEntries, setFirestoreEntries] = useState([])
  const [localEntries, setLocalEntries] = useState(loadLocalEntries)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(firebaseError ? new Error(firebaseError) : null)
  const [submitting, setSubmitting] = useState(false)
  const [savedLocally, setSavedLocally] = useState(false)

  useEffect(() => {
    if (!db || firebaseError) {
      setLoading(false)
      return
    }
    const docRef = doc(db, 'homeContent', 'easterEggLeaderboard')
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        const list = (snapshot.exists() && Array.isArray(snapshot.data().entries))
          ? snapshot.data().entries
          : []
        const normalized = list
          .map((e) => ({
            id: e.id || generateId(),
            score: Number(e.score) ?? 0,
            level: Number(e.level) ?? 1,
            playerName: String(e.playerName ?? '').trim().slice(0, 30),
            createdAt: toMillis(e.createdAt),
          }))
        setFirestoreEntries(normalized)
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

  const entries = useMemo(() => {
    const combined = [
      ...firestoreEntries,
      ...localEntries.map((e) => ({
        id: e.id,
        score: Number(e.score) ?? 0,
        level: Number(e.level) ?? 1,
        playerName: String(e.playerName ?? '').trim().slice(0, 30),
        createdAt: typeof e.createdAt === 'number' ? e.createdAt : 0,
      })),
    ]
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return b.createdAt - a.createdAt
      })
      .slice(0, TOP_N)
    return combined
  }, [firestoreEntries, localEntries])

  async function submitScore({ score, level, playerName = '' }) {
    setSubmitting(true)
    setSavedLocally(false)
    const payload = {
      score: Number(score),
      level: Number(level),
      playerName: String(playerName).trim().slice(0, 30),
    }
    const newEntry = {
      id: generateId(),
      ...payload,
      createdAt: null,
    }
    if (db && !firebaseError) {
      try {
        const docRef = doc(db, 'homeContent', 'easterEggLeaderboard')
        const snap = await getDoc(docRef)
        const current = (snap.exists() && Array.isArray(snap.data().entries))
          ? snap.data().entries
          : []
        const combined = [
          ...current,
          { ...newEntry, createdAt: serverTimestamp() },
        ]
          .sort((a, b) => (Number(b.score) ?? 0) - (Number(a.score) ?? 0))
          .slice(0, MAX_ENTRIES)
        await setDoc(docRef, { entries: combined, updatedAt: serverTimestamp() }, { merge: true })
      } catch (err) {
        saveLocalEntry({ ...newEntry, createdAt: Date.now() })
        setLocalEntries(loadLocalEntries())
        setSavedLocally(true)
      }
    } else {
      saveLocalEntry({ ...newEntry, createdAt: Date.now() })
      setLocalEntries(loadLocalEntries())
      setSavedLocally(true)
    }
    setSubmitting(false)
  }

  return { entries, loading, error, submitting, submitScore, savedLocally }
}
