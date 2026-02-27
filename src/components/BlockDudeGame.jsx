import { useBlockDude } from '../hooks/useBlockDude'

const TILE = { WALL: 'W', EMPTY: ' ', FLOOR: 'F', BLOCK: 'B', DOOR: 'D' }

function tileClass(cell) {
  if (cell === TILE.WALL) return 'block-dude-tile block-dude-tile--wall'
  if (cell === TILE.FLOOR) return 'block-dude-tile block-dude-tile--floor'
  if (cell === TILE.BLOCK) return 'block-dude-tile block-dude-tile--block'
  if (cell === TILE.DOOR) return 'block-dude-tile block-dude-tile--door'
  return 'block-dude-tile block-dude-tile--empty'
}

export default function BlockDudeGame({ onClose }) {
  const {
    grid,
    player,
    holding,
    level,
    moves,
    rows,
    cols,
    levelComplete,
    gameComplete,
    started,
    resetLevel,
    nextLevel,
    startGame,
    totalLevels,
  } = useBlockDude()

  return (
    <div className="easter-egg-modal" role="dialog" aria-label="Block Dude puzzle game">
      <div className="block-dude-game">
        <div className="block-dude-header">
          <span className="block-dude-level">Level {level}/{totalLevels}</span>
          <span className="block-dude-moves">Moves: {moves}</span>
          {holding && <span className="block-dude-holding">Holding block</span>}
          <button type="button" className="block-dude-close" onClick={onClose} aria-label="Close game">
            ×
          </button>
        </div>
        <div
          className="block-dude-grid-wrap"
          style={{
            '--bd-cols': cols,
            '--bd-rows': rows,
          }}
        >
          <div className="block-dude-grid">
            {grid.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className={tileClass(cell)}
                  style={{ gridColumn: c + 1, gridRow: r + 1 }}
                >
                  {cell === TILE.BLOCK && <span className="block-dude-block-emoji" aria-hidden>🧱</span>}
                  {cell === TILE.DOOR && <span className="block-dude-door-emoji" aria-hidden>🚪</span>}
                </div>
              ))
            )}
            <div
              className="block-dude-player"
              style={{
                gridColumn: player.col + 1,
                gridRow: player.row + 1,
              }}
            >
              <span className="block-dude-player-emoji" aria-hidden>🧍</span>
            </div>
          </div>
          {started && levelComplete && !gameComplete && (
            <div className="block-dude-overlay">
              <p>Level complete!</p>
              <button type="button" className="btn btn-primary" onClick={nextLevel}>
                Next level
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetLevel}>
                Play again
              </button>
            </div>
          )}
          {gameComplete && (
            <div className="block-dude-overlay">
              <p>You escaped!</p>
              <p>All {totalLevels} levels complete.</p>
              <button type="button" className="btn btn-primary" onClick={startGame}>
                Play again
              </button>
            </div>
          )}
        </div>
        {!started ? (
          <div className="block-dude-intro">
            <p className="block-dude-intro-title">Block Dude</p>
            <p className="block-dude-intro-desc">Move blocks to reach the door.</p>
            <p className="block-dude-intro-controls">← → move, ↑ jump, ↓ pick up / put down, R reset</p>
            <button type="button" className="btn btn-primary" onClick={startGame}>
              Start
            </button>
          </div>
        ) : (
          <p className="block-dude-controls-hint">← → move · ↑ jump · ↓ pick/place · R reset</p>
        )}
      </div>
    </div>
  )
}
