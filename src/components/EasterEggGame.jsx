import { useState } from 'react'
import { useEasterEggGame } from '../hooks/useEasterEggGame'
import { useLeaderboard } from '../hooks/useLeaderboard'

export default function EasterEggGame({ onClose, canSubmit }) {
  const {
    basketX,
    basketY,
    items,
    score,
    level,
    misses,
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
  } = useEasterEggGame()

  const { entries, loading: leaderboardLoading, submitting, submitScore } = useLeaderboard()
  const [submitted, setSubmitted] = useState(false)
  const [playerName, setPlayerName] = useState('')

  const handleSubmit = () => {
    if (!canSubmit || submitted) return
    const name = playerName.trim() || 'Anonymous'
    submitScore({ score, level, playerName: name }).then(() => setSubmitted(true)).catch(() => {})
  }

  return (
    <div className="easter-egg-modal" role="dialog" aria-label="Easter egg game">
      <div className="easter-egg-game">
        <div className="easter-egg-header">
          <span className="easter-egg-score">Score: {score}</span>
          <span className="easter-egg-level">Level {level}</span>
          <span className="easter-egg-misses">
            {misses}/{MAX_MISSES} misses
          </span>
          <button type="button" className="easter-egg-close" onClick={onClose} aria-label="Close game">
            ×
          </button>
        </div>
        <div
          className="easter-egg-play-wrap"
          style={{ width: PLAY_AREA_WIDTH, height: PLAY_AREA_HEIGHT }}
        >
          <div
            className="easter-egg-play-area"
            style={{ width: PLAY_AREA_WIDTH, height: PLAY_AREA_HEIGHT }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              setBasketFromPlayAreaX(x)
            }}
          >
            <div
              className="easter-egg-catcher"
              style={{
                transform: `translate(${basketX}px, ${basketY}px)`,
                width: BASKET_WIDTH,
                height: BASKET_HEIGHT,
              }}
            >
              <span className="easter-egg-catcher-hand" aria-hidden>👋</span>
            </div>
            {items.map((item) => (
              <div
                key={item.id}
                className={`easter-egg-item ${item.bonus ? 'easter-egg-item-bonus' : ''}`}
                style={{
                  transform: `translate(${item.x}px, ${item.y}px)`,
                  width: ITEM_SIZE,
                  height: ITEM_SIZE,
                }}
              />
            ))}
          </div>
          {!gameStarted && (
            <div className="easter-egg-overlay">
              <p>Catch the falling items!</p>
              <p>Use ← → keys or move the mouse at the bottom.</p>
              <button type="button" className="btn btn-primary" onClick={startGame}>
                Start
              </button>
            </div>
          )}
          {gameOver && (
            <div className="easter-egg-overlay">
            <p>Game over</p>
            <p>
              Score: {score} — Level {level}
            </p>
            <button type="button" className="btn btn-primary" onClick={startGame}>
              Play again
            </button>
            {canSubmit && (
              <>
                <label htmlFor="easter-egg-name" className="easter-egg-name-label">
                  Your name
                </label>
                <input
                  id="easter-egg-name"
                  type="text"
                  className="easter-egg-name-input"
                  placeholder="Anonymous"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={30}
                  disabled={submitted}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleSubmit}
                  disabled={submitting || submitted}
                >
                  {submitted ? 'Submitted!' : 'Submit score'}
                </button>
              </>
            )}
            <div className="easter-egg-leaderboard-preview">
              <h4>Top scores</h4>
              {leaderboardLoading ? (
                <p>Loading…</p>
              ) : (
                <ol>
                  {entries.slice(0, 5).map((e, i) => (
                    <li key={e.id}>
                      {i + 1}. {e.playerName || 'Anonymous'} — {e.score} (L{e.level})
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
          )}
        </div>
        <div className="easter-egg-leaderboard">
          <h4>Leaderboard</h4>
          {leaderboardLoading ? (
            <p>Loading…</p>
          ) : (
            <ol>
              {entries.map((e, i) => (
                <li key={e.id}>
                  {i + 1}. {e.playerName || 'Anonymous'} — {e.score} (L{e.level})
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
