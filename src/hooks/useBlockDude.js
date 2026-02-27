import { useState, useCallback, useEffect, useRef } from 'react'
import { LEVELS } from '../data/blockDudeLevels'

const TILE = { WALL: 'W', EMPTY: ' ', FLOOR: 'F', BLOCK: 'B', DOOR: 'D' }

function parseLevel(levelIndex) {
  const level = LEVELS[levelIndex]
  if (!level) return null
  const rows = level.map.length
  const cols = level.map[0].length
  const grid = level.map.map((row) => row.split(''))
  let player = { ...level.playerStart }
  const pr = player.row
  const pc = player.col
  if (grid[pr][pc] === 'P') grid[pr][pc] = ' '
  return { grid, player, rows, cols }
}

function isSolid(cell) {
  return cell === TILE.WALL || cell === TILE.FLOOR || cell === TILE.BLOCK
}

function getBlockDropRow(grid, col, startRow, rows) {
  for (let r = startRow; r < rows; r++) {
    const cell = grid[r]?.[col]
    const below = grid[r + 1]?.[col]
    if (cell === TILE.EMPTY && isSolid(below)) return r
  }
  return -1
}

function applyGravity(grid, player, rows) {
  let { row, col } = player
  while (row + 1 < rows) {
    const below = grid[row + 1]?.[col]
    if (below === TILE.WALL || below === TILE.FLOOR || below === TILE.BLOCK) break
    row += 1
  }
  return { row, col }
}

export function useBlockDude() {
  const [levelIndex, setLevelIndex] = useState(0)
  const [grid, setGrid] = useState(() => [])
  const [player, setPlayer] = useState(() => ({ row: 0, col: 0 }))
  const [rows, setRows] = useState(0)
  const [cols, setCols] = useState(0)
  const [holding, setHolding] = useState(false)
  const [facing, setFacing] = useState(1)
  const [moves, setMoves] = useState(0)
  const [levelComplete, setLevelComplete] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [started, setStarted] = useState(false)
  const levelDataRef = useRef(null)

  const loadLevel = useCallback((index) => {
    const parsed = parseLevel(index)
    if (!parsed) return
    levelDataRef.current = { index, ...parseLevel(index) }
    const { grid: g, player: p, rows: r, cols: c } = levelDataRef.current
    const gridCopy = g.map((row) => [...row])
    setGrid(gridCopy)
    const landed = applyGravity(gridCopy, p, r)
    setPlayer(landed)
    setRows(r)
    setCols(c)
    setLevelIndex(index)
    setHolding(false)
    setFacing(1)
    setLevelComplete(false)
  }, [])

  const resetLevel = useCallback(() => {
    if (levelDataRef.current) {
      const { grid: g, player: p, rows: r, cols: c } = parseLevel(levelDataRef.current.index)
      setGrid(g.map((row) => [...row]))
      setPlayer(p)
      setRows(r)
      setCols(c)
      setHolding(false)
      setLevelComplete(false)
    }
  }, [])

  const nextLevel = useCallback(() => {
    setLevelComplete(false)
    const next = levelIndex + 1
    if (next >= LEVELS.length) {
      setGameComplete(true)
      return
    }
    loadLevel(next)
  }, [levelIndex, loadLevel])

  useEffect(() => {
    loadLevel(0)
  }, [loadLevel])

  const getCell = useCallback(
    (r, c) => {
      if (r < 0 || r >= rows || c < 0 || c >= cols) return TILE.WALL
      return grid[r][c]
    },
    [grid, rows, cols]
  )

  const setCell = useCallback((r, c, value) => {
    setGrid((g) => {
      const next = g.map((row) => [...row])
      if (r >= 0 && r < next.length && c >= 0 && c < next[0].length) next[r][c] = value
      return next
    })
  }, [])

  const tryMove = useCallback(
    (dCol) => {
      if (levelComplete || gameComplete) return
      const { row, col } = player
      const targetCol = col + dCol
      const targetCell = getCell(row, targetCol)
      const belowTarget = getCell(row + 1, targetCol)
      const aboveTarget = getCell(row - 1, targetCol)

      if (targetCell === TILE.DOOR) {
        setPlayer({ row, col: targetCol })
        setMoves((m) => m + 1)
        setLevelComplete(true)
        return
      }

      if (targetCell !== TILE.EMPTY && targetCell !== TILE.DOOR) return

      const frontSameRow = getCell(row, targetCol)
      const aboveFront = getCell(row - 1, targetCol)
      if (row - 1 >= 0 && aboveFront === TILE.EMPTY && isSolid(frontSameRow) && isSolid(getCell(row + 1, col))) {
        setFacing(dCol)
        setPlayer({ row: row - 1, col: targetCol })
        setMoves((m) => m + 1)
        return
      }

      setFacing(dCol)
      setPlayer(applyGravity(grid, { row, col: targetCol }, rows))
      setMoves((m) => m + 1)
    },
    [player, grid, rows, getCell, levelComplete, gameComplete]
  )

  const tryPickupOrPlace = useCallback(
    (direction) => {
      if (levelComplete || gameComplete) return
      const { row, col } = player
      const frontCol = col + direction
      const front = getCell(row, frontCol)
      const frontBelow = getCell(row + 1, frontCol)
      const frontAbove = getCell(row - 1, frontCol)

      if (holding) {
        if (front === TILE.EMPTY) {
          const dropRow = getBlockDropRow(grid, frontCol, row, rows)
          if (dropRow >= 0) {
            setCell(dropRow, frontCol, TILE.BLOCK)
            setHolding(false)
            setMoves((m) => m + 1)
          }
        } else if (row - 1 >= 0 && frontAbove === TILE.EMPTY && front === TILE.EMPTY) {
          const dropRow = getBlockDropRow(grid, frontCol, row - 1, rows)
          if (dropRow >= 0) {
            setCell(dropRow, frontCol, TILE.BLOCK)
            setHolding(false)
            setMoves((m) => m + 1)
          }
        }
        return
      }

      if (front === TILE.BLOCK) {
        const nextGrid = grid.map((r, ri) => (ri === row ? r.map((cell, ci) => (ci === frontCol ? TILE.EMPTY : cell)) : [...r]))
        setGrid(nextGrid)
        setHolding(true)
        setMoves((m) => m + 1)
        setPlayer(applyGravity(nextGrid, player, rows))
        return
      }
      if (row - 1 >= 0 && frontAbove === TILE.BLOCK) {
        const nextGrid = grid.map((r, ri) => (ri === row - 1 ? r.map((cell, ci) => (ci === frontCol ? TILE.EMPTY : cell)) : [...r]))
        setGrid(nextGrid)
        setHolding(true)
        setMoves((m) => m + 1)
        setPlayer(applyGravity(nextGrid, player, rows))
      }
    },
    [player, grid, rows, getCell, setCell, holding, levelComplete, gameComplete]
  )

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        tryMove(-1)
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        tryMove(1)
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        tryPickupOrPlace(facing)
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        resetLevel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tryMove, tryPickupOrPlace, resetLevel, facing])

  const startGame = useCallback(() => {
    setStarted(true)
    setGameComplete(false)
    setMoves(0)
    loadLevel(0)
  }, [loadLevel])

  return {
    grid,
    player,
    holding,
    facing,
    level: levelIndex + 1,
    moves,
    rows,
    cols,
    levelComplete,
    gameComplete,
    started,
    resetLevel,
    nextLevel,
    startGame,
    totalLevels: LEVELS.length,
  }
}
