/**
 * Vercel serverless API: leaderboard read/write via Firebase Admin.
 * GET = top 10 scores. POST = submit a score (body: { score, level, playerName }).
 * Set FIREBASE_SERVICE_ACCOUNT_JSON in Vercel env to the full JSON string of your service account key.
 */

import admin from 'firebase-admin'

const COLLECTION = 'easterEggScores'
const TOP_N = 10

function getDb() {
  if (admin.apps.length > 0) {
    return admin.firestore()
  }
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!json) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not set')
  }
  const cred = JSON.parse(json)
  admin.initializeApp({ credential: admin.credential.cert(cred) })
  return admin.firestore()
}

function cors(res, req) {
  const origin = req.headers.origin
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Max-Age', '86400')
}

export default async function handler(req, res) {
  cors(res, req)
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const db = getDb()
    const col = db.collection(COLLECTION)

    if (req.method === 'GET') {
      const snap = await col.orderBy('score', 'desc').limit(TOP_N).get()
      const entries = snap.docs.map((d) => ({
        id: d.id,
        score: d.data().score ?? 0,
        level: d.data().level ?? 1,
        playerName: (d.data().playerName ?? '').trim().slice(0, 30),
        createdAt: d.data().createdAt?.toMillis?.() ?? 0,
      }))
      return res.status(200).json(entries)
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
      const score = Number(body.score)
      const level = Number(body.level)
      const playerName = String(body.playerName ?? '').trim().slice(0, 30)
      if (!Number.isFinite(score) || score < 0) {
        return res.status(400).json({ error: 'Invalid score' })
      }
      await col.add({
        score,
        level: Number.isFinite(level) ? level : 1,
        playerName: playerName || 'Anonymous',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      return res.status(200).json({ ok: true })
    }
  } catch (err) {
    console.error('Leaderboard API error:', err.message)
    return res.status(500).json({ error: err.message || 'Server error' })
  }
}
