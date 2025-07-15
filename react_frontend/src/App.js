import React, { useState, useEffect } from "react";
import "./App.css";

// Color variables via .env (if present)
const PRIMARY_COLOR = process.env.REACT_APP_PRIMARY_COLOR || "#4caf50";
const SECONDARY_COLOR = process.env.REACT_APP_SECONDARY_COLOR || "#2196f3";
const ACCENT_COLOR = process.env.REACT_APP_ACCENT_COLOR || "#ff9800";

// Helper functions

// PUBLIC_INTERFACE
function calculateWinner(squares) {
  /** Returns 'X', 'O', or null. */
  const lines = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
  ];
  for (let [a,b,c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
          return squares[a];
      }
  }
  return null;
}

// PUBLIC_INTERFACE
function getAvailableMoves(squares) {
  /** Returns array of indices for empty cells */
  return squares.map((v,i) => v ? null : i).filter((v) => v!==null);
}

// PUBLIC_INTERFACE
function calculateAIMove(squares, aiPlayer, humanPlayer) {
  /** Basic AI - win if possible, block win, else pick random */
  const avail = getAvailableMoves(squares);

  // Try to win
  for (let idx of avail) {
      const test = squares.slice();
      test[idx] = aiPlayer;
      if (calculateWinner(test) === aiPlayer) return idx;
  }
  // Try to block human win
  for (let idx of avail) {
      const test = squares.slice();
      test[idx] = humanPlayer;
      if (calculateWinner(test) === humanPlayer) return idx;
  }
  // Center if available
  if (avail.includes(4)) return 4;
  // Corners first
  const corners = avail.filter(i => [0,2,6,8].includes(i));
  if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
  // Otherwise random
  return avail[Math.floor(Math.random()*avail.length)];
}

const GAME_MODES = {
  PVP: "Player vs Player",
  AI: "Player vs AI"
};

function useEnvColors() {
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--accent", ACCENT_COLOR);
    r.style.setProperty("--primary", PRIMARY_COLOR);
    r.style.setProperty("--secondary", SECONDARY_COLOR);
  }, []);
}

// PUBLIC_INTERFACE
function App() {
  /** Main app */
  // Game state
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameMode, setGameMode] = useState(GAME_MODES.PVP);
  const [status, setStatus] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);

  useEnvColors();

  // Effect: update status
  useEffect(() => {
    const winner = calculateWinner(squares);
    if (winner) {
      setStatus(`Winner: ${winner}`);
      setIsGameOver(true);
    } else if (squares.every(Boolean)) {
      setStatus("Draw!");
      setIsGameOver(true);
    } else {
      setStatus(
        gameMode === GAME_MODES.AI && !xIsNext
          ? "AI's turn (O)"
          : `Next player: ${xIsNext ? "X" : "O"}`
      );
      setIsGameOver(false);
    }
  }, [squares, xIsNext, gameMode]);

  // Effect: AI move (if mode is AI and it's O's turn)
  useEffect(() => {
    if (
      gameMode === GAME_MODES.AI &&
      !xIsNext &&
      !calculateWinner(squares) &&
      squares.some(v => !v) &&
      !isGameOver
    ) {
      const move = calculateAIMove(squares, "O", "X");
      setTimeout(() => {
        const next = squares.slice();
        next[move] = "O";
        setSquares(next);
        setXIsNext(true);
      }, 450);
    }
    // eslint-disable-next-line
  }, [squares, xIsNext, gameMode, isGameOver]);

  // PUBLIC_INTERFACE
  function handleClick(i) {
    if (squares[i] || isGameOver) return;
    // Block clicks during AI's turn
    if (gameMode === GAME_MODES.AI && !xIsNext) return;

    const next = squares.slice();
    next[i] = xIsNext ? "X" : "O";
    setSquares(next);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function restartGame() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setStatus("");
    setIsGameOver(false);
  }

  // PUBLIC_INTERFACE
  function handleModeChange(mode) {
    setGameMode(mode);
    restartGame();
  }

  return (
    <div className="ttt-app-root">
      <div className="game-container">
        <div className="game-status" data-testid="game-status">
          {status}
        </div>
        <Board squares={squares} onClick={handleClick} isGameOver={isGameOver}/>
        <div className="controls">
          <div className="mode-switcher">
            <button
              className={`ctrl-btn ${gameMode===GAME_MODES.PVP?"active":""}`}
              style={{
                borderColor: "var(--primary)"
              }}
              onClick={() => handleModeChange(GAME_MODES.PVP)}
              disabled={gameMode === GAME_MODES.PVP}
              aria-label="Switch to Player vs Player mode"
            >
              PvP
            </button>
            <button
              className={`ctrl-btn ${gameMode===GAME_MODES.AI?"active":""}`}
              style={{
                borderColor: "var(--secondary)"
              }}
              onClick={() => handleModeChange(GAME_MODES.AI)}
              disabled={gameMode === GAME_MODES.AI}
              aria-label="Switch to Player vs AI mode"
            >
              Vs AI
            </button>
          </div>
          <button
            className="ctrl-btn restart-btn"
            onClick={restartGame}
            aria-label="Restart game"
            style={{ color: "var(--accent)" }}
          >
            Restart
          </button>
        </div>
      </div>
      <footer className="ttt-footer">
        <span>
          Minimal Tic-Tac-Toe •&nbsp;
          <a
            href="https://react.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            React
          </a>
        </span>
      </footer>
    </div>
  );
}

// PUBLIC_INTERFACE
function Board({ squares, onClick, isGameOver }) {
  /** Renders a 3x3 grid */
  return (
    <div className="ttt-board" aria-label="Tic Tac Toe Board">
      {squares.map((val, i) => (
        <Square
          key={i}
          value={val}
          onClick={() => onClick(i)}
          disabled={!!val || isGameOver}
        />
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function Square({ value, onClick, disabled }) {
  /** Individual clickable square */
  return (
    <button
      className="ttt-square"
      onClick={onClick}
      disabled={disabled}
      aria-label={
        value
          ? `Square: ${value}`
          : disabled
          ? "Disabled square"
          : "Empty square"
      }
    >
      {value}
    </button>
  );
}

export default App;
