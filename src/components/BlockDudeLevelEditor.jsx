import { useState, useCallback } from 'react'
import { LEVELS } from '../data/blockDudeLevels'

const TILES = [
  { id: 'W', label: 'Wall', char: 'W' },
  { id: ' ', label: 'Empty', char: ' ' },
  { id: 'F', label: 'Floor', char: 'F' },
  { id: 'B', label: 'Block', char: 'B' },
  { id: 'D', label: 'Door', char: 'D' },
  { id: 'P', label: 'Player', char: 'P' },
]

const TILE_DEFINITIONS = [
  { char: 'W', name: 'Wall', desc: 'Solid barrier. The player and blocks cannot pass through walls.' },
  { char: ' ', name: 'Empty', desc: 'Open air. The player and blocks can fall through empty space (gravity).' },
  { char: 'F', name: 'Floor', desc: 'Solid platform. The player can walk and stand on floors; blocks can rest on them.' },
  { char: 'B', name: 'Block', desc: 'Movable crate. The player can pick up and put down blocks to build stairs and cross gaps.' },
  { char: 'D', name: 'Door', desc: 'Exit. Reaching the door completes the level. Use exactly one door per level.' },
  { char: 'P', name: 'Player start', desc: 'Where the player character begins the level. Use exactly one P per level.' },
]

const MIN_ROWS = 6
const MAX_ROWS = 20
const MIN_COLS = 8
const MAX_COLS = 24

function levelToGrid(level) {
  const grid = level.map.map((row) => row.split(''))
  const { row: pr, col: pc } = level.playerStart
  if (grid[pr] && grid[pr][pc] !== undefined) {
    const next = grid.map((row) => [...row])
    next[pr][pc] = 'P'
    return next
  }
  return grid
}

function gridToLevel(grid) {
  let playerStart = { row: 0, col: 0 }
  const map = grid.map((row, r) =>
    row.map((cell, c) => {
      if (cell === 'P') {
        playerStart = { row: r, col: c }
        return ' '
      }
      return cell
    }).join('')
  )
  return { map, playerStart }
}

function emptyGrid(rows, cols) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ' '))
}

export default function BlockDudeLevelEditor() {
  const [view, setView] = useState('list')
  const [editingIndex, setEditingIndex] = useState(null)
  const [rows, setRows] = useState(8)
  const [cols, setCols] = useState(12)
  const [grid, setGrid] = useState(() => emptyGrid(8, 12))
  const [selectedTile, setSelectedTile] = useState('W')
  const [copyFeedback, setCopyFeedback] = useState(false)

  const levels = LEVELS

  const startNew = useCallback(() => {
    setEditingIndex(null)
    setRows(8)
    setCols(12)
    setGrid(emptyGrid(8, 12))
    setView('editor')
  }, [])

  const startEdit = useCallback((index) => {
    const level = levels[index]
    const g = levelToGrid(level)
    setEditingIndex(index)
    setRows(g.length)
    setCols(g[0].length)
    setGrid(g.map((row) => [...row]))
    setView('editor')
  }, [levels])

  const backToList = useCallback(() => {
    setView('list')
  }, [])

  const setGridSize = useCallback((newRows, newCols) => {
    const r = Math.min(MAX_ROWS, Math.max(MIN_ROWS, newRows))
    const c = Math.min(MAX_COLS, Math.max(MIN_COLS, newCols))
    setRows(r)
    setCols(c)
    setGrid((prev) => {
      const next = emptyGrid(r, c)
      for (let i = 0; i < Math.min(prev.length, r); i++) {
        for (let j = 0; j < Math.min(prev[0].length, c); j++) {
          next[i][j] = prev[i][j]
        }
      }
      return next
    })
  }, [])

  const setCell = useCallback((r, c, value) => {
    setGrid((prev) => {
      const next = prev.map((row) => [...row])
      if (value === 'P') {
        for (let i = 0; i < prev.length; i++) {
          for (let j = 0; j < prev[0].length; j++) {
            if (next[i][j] === 'P') next[i][j] = ' '
          }
        }
      }
      next[r][c] = value
      return next
    })
  }, [])

  const exportLevel = useCallback(() => {
    const level = gridToLevel(grid)
    const snippet = `  {
    map: [
${level.map.map((row) => `      '${row.replace(/'/g, "\\'")}',`).join('\n')}
    ],
    playerStart: { row: ${level.playerStart.row}, col: ${level.playerStart.col} },
  },`
    return snippet
  }, [grid])

  const copyToClipboard = useCallback(() => {
    const text = exportLevel()
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 2000)
    })
  }, [exportLevel])

  if (view === 'list') {
    return (
      <section className="admin-home-section">
        <h2 className="admin-section-title">Block Dude levels</h2>
        <p className="admin-empty" style={{ marginBottom: '1rem' }}>
          Design levels for the Block Dude game. Edit a level or add a new one, then copy the exported code into <code>src/data/blockDudeLevels.js</code>.
        </p>
        <details className="block-dude-definitions">
          <summary>What each tile is</summary>
          <dl className="block-dude-definitions-list">
            {TILE_DEFINITIONS.map((t) => (
              <div key={t.char === ' ' ? 'space' : t.char} className="block-dude-definition">
                <dt><span className={`block-dude-def-char block-dude-def-char--${t.char === ' ' ? 'empty' : t.char}`}>{t.char === ' ' ? '·' : t.char}</span> {t.name}</dt>
                <dd>{t.desc}</dd>
              </div>
            ))}
          </dl>
        </details>
        <div className="admin-form-actions" style={{ marginBottom: '1.5rem' }}>
          <button type="button" className="btn btn-primary" onClick={startNew}>
            Add level
          </button>
        </div>
        <ul className="admin-items block-dude-level-list">
          {levels.map((level, index) => (
            <li key={index} className="admin-item">
              <div className="admin-item-info">
                <strong>Level {index + 1}</strong>
                <span className="block-dude-level-preview">
                  {level.map.length}×{level.map[0].length} · door at row {level.map.findIndex((row) => row.includes('D'))}
                </span>
              </div>
              <div className="admin-item-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEdit(index)}>
                  Edit
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <section className="admin-home-section block-dude-editor-section">
      <h2 className="admin-section-title">{editingIndex !== null ? `Edit level ${editingIndex + 1}` : 'New level'}</h2>

      <details className="block-dude-definitions block-dude-definitions-inline">
        <summary>What each tile is</summary>
        <dl className="block-dude-definitions-list">
          {TILE_DEFINITIONS.map((t) => (
            <div key={t.char === ' ' ? 'space' : t.char} className="block-dude-definition">
              <dt><span className={`block-dude-def-char block-dude-def-char--${t.char === ' ' ? 'empty' : t.char}`}>{t.char === ' ' ? '·' : t.char}</span> {t.name}</dt>
              <dd>{t.desc}</dd>
            </div>
          ))}
        </dl>
      </details>

      <div className="block-dude-editor-toolbar">
        <div className="block-dude-editor-palette">
          <span className="block-dude-palette-label">Tile:</span>
          {TILES.map((t) => (
            <button
              key={t.id === ' ' ? 'space' : t.id}
              type="button"
              className={`block-dude-palette-btn ${selectedTile === t.char ? 'active' : ''}`}
              onClick={() => setSelectedTile(t.char)}
              title={t.label}
            >
              <span className={`block-dude-palette-cell block-dude-palette-cell--${t.id === ' ' ? 'empty' : t.id}`}>
                {t.char === ' ' ? '·' : t.char}
              </span>
            </button>
          ))}
        </div>
        <div className="block-dude-editor-size">
          <label>
            Rows
            <input
              type="number"
              min={MIN_ROWS}
              max={MAX_ROWS}
              value={rows}
              onChange={(e) => setGridSize(parseInt(e.target.value, 10) || MIN_ROWS, cols)}
            />
          </label>
          <label>
            Cols
            <input
              type="number"
              min={MIN_COLS}
              max={MAX_COLS}
              value={cols}
              onChange={(e) => setGridSize(rows, parseInt(e.target.value, 10) || MIN_COLS)}
            />
          </label>
        </div>
      </div>

      <div
        className="block-dude-editor-grid"
        style={{ '--bd-cols': cols, '--bd-rows': rows }}

      >
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              type="button"
              className={`block-dude-editor-cell block-dude-editor-cell--${cell === ' ' ? 'empty' : cell}`}
              onClick={() => setCell(r, c, selectedTile)}
              style={{ gridColumn: c + 1, gridRow: r + 1 }}
            >
              {cell === ' ' ? '·' : cell}
            </button>
          ))
        )}
      </div>

      <div className="block-dude-editor-actions">
        <button type="button" className="btn btn-secondary" onClick={backToList}>
          Back to list
        </button>
        <button type="button" className="btn btn-primary" onClick={copyToClipboard}>
          {copyFeedback ? 'Copied!' : 'Copy level code'}
        </button>
      </div>
    </section>
  )
}
