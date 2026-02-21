import { useState, useEffect, useMemo } from 'react'

const TOP_N = 10
const LOCAL_STORAGE_KEY = 'easterEggLeaderboardLocal'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
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
  const trimmed = list.slice(-20)
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmed))
}

function getApiUrl() {
  const base = import.meta.env.VITE_LEADERBOARD_API_URL || ''
  return `${base}/api/leaderboard`.replace(/\/+/g, '/')
}

export function useLeaderboard() {
  const [apiEntries, setApiEntries] = useState([])
  const [localEntries, setLocalEntries] = useState(loadLocalEntries)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [savedLocally, setSavedLocally] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(getApiUrl())
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 403 ? 'Missing or insufficient permissions.' : `HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setApiEntries(data)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err)
          setApiEntries([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const entries = useMemo(() => {
    const combined = [
      ...apiEntries,
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
        return (b.createdAt ?? 0) - (a.createdAt ?? 0)
      })
      .slice(0, TOP_N)
    return combined
  }, [apiEntries, localEntries])

  async function submitScore({ score, level, playerName = '' }) {
    setSubmitting(true)
    setSavedLocally(false)
    const payload = {
      score: Number(score),
      level: Number(level),
      playerName: String(playerName).trim().slice(0, 30) || 'Anonymous',
    }
    const newEntry = {
      id: generateId(),
      ...payload,
      createdAt: Date.now(),
    }

    try {
      const res = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const refetch = await fetch(getApiUrl())
        if (refetch.ok) {
          const data = await refetch.json().catch(() => [])
          if (Array.isArray(data)) setApiEntries(data)
        }
      } else {
        const errBody = await res.json().catch(() => ({}))
        const msg = errBody?.error || (res.status === 403 ? 'Missing or insufficient permissions.' : `HTTP ${res.status}`)
        throw new Error(msg)
      }
    } catch (err) {
      saveLocalEntry(newEntry)
      setLocalEntries(loadLocalEntries())
      setSavedLocally(true)
      setError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return { entries, loading, error, submitting, submitScore, savedLocally }
}
