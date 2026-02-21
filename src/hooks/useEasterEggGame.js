import { useState, useCallback, useRef, useEffect } from 'react'

const BASKET_WIDTH = 80
const BASKET_HEIGHT = 24
const ITEM_SIZE = 28
const PLAY_AREA_WIDTH = 400
const PLAY_AREA_HEIGHT = 500
const BASKET_Y = PLAY_AREA_HEIGHT - BASKET_HEIGHT - 20
const BASKET_SPEED = 8
const SPAWN_INTERVAL_BASE_MS = 1200
const FALL_SPEED_LEVEL_1 = 2
const LEVEL_SCORE_THRESHOLDS = [0, 100, 300, 600]
const MAX_LEVEL = 4
const MAX_MISSES = 3
const GEM_POINTS = 15
const COIN_POINTS = 10
const BILL_POINTS = 25
const MONEY_POINTS = 20
function getBombSpawnChance(lvl) {
  return 0.04 + (lvl - 1) * 0.02
}
function pickGoodItemType() {
  const r = Math.random() * 100
  if (r < 45) return 'coin'
  if (r < 75) return 'bill'
  if (r < 87) return 'money'
  return 'gem'
}

export function useEasterEggGame() {
  const [basketX, setBasketX] = useState((PLAY_AREA_WIDTH - BASKET_WIDTH) / 2)
  const [items, setItems] = useState([])
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [misses, setMisses] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const rafRef = useRef(null)
  const lastSpawnRef = useRef(0)
  const keysRef = useRef({ left: false, right: false })
  const basketXRef = useRef(basketX)
  basketXRef.current = basketX

  const getFallSpeed = useCallback((lvl) => {
    return FALL_SPEED_LEVEL_1 + (lvl - 1) * 1.2
  }, [])

  const getSpawnInterval = useCallback((lvl) => {
    return Math.max(400, SPAWN_INTERVAL_BASE_MS - (lvl - 1) * 200)
  }, [])

  const startGame = useCallback(() => {
    setBasketX((PLAY_AREA_WIDTH - BASKET_WIDTH) / 2)
    setItems([])
    setScore(0)
    setLevel(1)
    setMisses(0)
    setIsPlaying(true)
    setGameOver(false)
    setGameStarted(true)
    lastSpawnRef.current = 0
  }, [])

  useEffect(() => {
    if (!isPlaying || gameOver) return

    let lastTime = 0
    function tick(timestamp) {
      rafRef.current = requestAnimationFrame(tick)
      const delta = timestamp - lastTime
      lastTime = timestamp

      setBasketX((prev) => {
        const dx = keysRef.current.right ? BASKET_SPEED : keysRef.current.left ? -BASKET_SPEED : 0
        const next = prev + dx * (delta / 16)
        return Math.max(0, Math.min(PLAY_AREA_WIDTH - BASKET_WIDTH, next))
      })

      setItems((prevItems) => {
        const fallSpeed = getFallSpeed(level)
        const next = prevItems
          .map((item) => ({
            ...item,
            y: item.y + fallSpeed * (delta / 16),
          }))
          .filter((item) => {
            if (item.y + ITEM_SIZE >= BASKET_Y) {
              const bx = basketXRef.current
              const basketCenter = bx + BASKET_WIDTH / 2
              const itemCenter = item.x + ITEM_SIZE / 2
              const caught = Math.abs(basketCenter - itemCenter) < BASKET_WIDTH / 2 + ITEM_SIZE / 2
              if (caught) {
                if (item.type === 'bomb') {
                  setGameOver(true)
                } else {
                  const points = item.type === 'gem' ? GEM_POINTS : item.type === 'coin' ? COIN_POINTS : item.type === 'bill' ? BILL_POINTS : MONEY_POINTS
                  setScore((s) => s + points)
                }
                return false
              }
              setMisses((m) => {
                const nextMiss = m + 1
                if (nextMiss >= MAX_MISSES) setGameOver(true)
                return nextMiss
              })
              return false
            }
            return true
          })
        return next
      })
    }
    rafRef.current = requestAnimationFrame((t) => {
      lastTime = t
      tick(t)
    })
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying, gameOver, level, getFallSpeed, basketX])

  useEffect(() => {
    if (!isPlaying || gameOver) return
    const threshold = LEVEL_SCORE_THRESHOLDS[level]
    if (level < MAX_LEVEL && score >= threshold && score > 0) {
      setLevel((l) => Math.min(MAX_LEVEL, l + 1))
    }
  }, [score, level, isPlaying, gameOver])

  useEffect(() => {
    if (!isPlaying || gameOver) return
    let lastSpawn = lastSpawnRef.current
    const interval = getSpawnInterval(level)
    const spawnId = setInterval(() => {
      lastSpawn += interval
      lastSpawnRef.current = lastSpawn
      const type = Math.random() < getBombSpawnChance(level) ? 'bomb' : pickGoodItemType()
      setItems((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          x: Math.random() * (PLAY_AREA_WIDTH - ITEM_SIZE),
          y: 0,
          type,
        },
      ])
    }, interval)
    return () => clearInterval(spawnId)
  }, [isPlaying, gameOver, level, getSpawnInterval])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') keysRef.current.left = true
      if (e.key === 'ArrowRight') keysRef.current.right = true
    }
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft') keysRef.current.left = false
      if (e.key === 'ArrowRight') keysRef.current.right = false
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const setBasketFromPlayAreaX = useCallback((playAreaX) => {
    const center = playAreaX - BASKET_WIDTH / 2
    setBasketX(Math.max(0, Math.min(PLAY_AREA_WIDTH - BASKET_WIDTH, center)))
  }, [])

  return {
    basketX,
    basketY: BASKET_Y,
    items,
    score,
    level,
    misses,
    isPlaying,
    gameOver,
    gameStarted,
    startGame,
    setBasketFromPlayAreaX,
    PLAY_AREA_WIDTH,
    PLAY_AREA_HEIGHT,
    BASKET_WIDTH,
    BASKET_HEIGHT,
    ITEM_SIZE,
    MAX_MISSES,
  }
}
