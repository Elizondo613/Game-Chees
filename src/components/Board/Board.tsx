// src/components/Board/Board.tsx
import type { Square } from 'chess.js';
import { Square as SquareComponent } from './Square';
import { Piece } from './Piece';
import { useChessGame } from '../../hooks/useChessGame';
import type { Difficulty } from '../../hooks/useChessGame';
import { useState, useEffect, useRef } from 'react';
import { CIVILIZATIONS } from '../../civilizations';
import type { Civilization } from '../../types/civilization.types';
import { UserPanel } from '../Auth/UserPanel';
import { AbilityPanel } from '../Abilities/AbilityPanel';
import { ConfigPanel } from './ConfigPanel';
import { GamePanel } from './GamePanel';

const FILES = ['a','b','c','d','e','f','g','h'];
const RANKS = ['8','7','6','5','4','3','2','1'];

function useBoardSize() {
  const [size, setSize] = useState(64);
  useEffect(() => {
    function calculate() {
      const w = window.innerWidth;
      if (w < 480) return setSize(Math.floor((w - 48) / 8));
      if (w < 768) return setSize(Math.floor((w - 80) / 8));
      return setSize(64);
    }
    calculate();
    window.addEventListener('resize', calculate);
    return () => window.removeEventListener('resize', calculate);
  }, []);
  return size;
}

interface BoardProps {
  onLogout?: () => void;
}

export function Board({ onLogout }: BoardProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [selectedTime, setSelectedTime] = useState(600);
  const [civId, setCivId] = useState('classic');
  const [configOpen, setConfigOpen] = useState(true); // panel colapsable
  const squareSize = useBoardSize();
  const moveLogRef = useRef<HTMLDivElement>(null);
  const civilization: Civilization = CIVILIZATIONS[civId] ?? CIVILIZATIONS['classic'];

  const {
    game, selectedSquare, legalMoves,
    handleSquareClick, isCheck, isCheckmate,
    isGameOver, turn, history, isAIThinking,
    shakeKey, whiteTime, blackTime,
    gameStarted, startGame, abilities, reset,
  } = useChessGame(difficulty, civilization, selectedTime);

  const lastHistoryMove = game.history({ verbose: true }).slice(-1)[0];

  useEffect(() => {
    if (moveLogRef.current) {
      moveLogRef.current.scrollTop = moveLogRef.current.scrollHeight;
    }
  }, [history]);

  // Colapsa el panel al iniciar
  function handleStart() {
    setConfigOpen(false);
    startGame();
  }

  function handleReset() {
    reset(selectedTime);
    setConfigOpen(true);
  }

  const boardPx = squareSize * 8;
  const isMobile = squareSize < 60;
  const hasAbilities = civilization.id !== 'classic';

  const statusText = isCheckmate
    ? `¡Jaque mate! Ganan ${turn === 'w' ? 'negras' : 'blancas'}`
    : isGameOver ? 'Tablas'
    : !gameStarted ? 'Configura y pulsa Jugar'
    : isAIThinking ? 'IA pensando...'
    : isCheck ? '¡Jaque!'
    : turn === 'w' ? 'Blancas — Tu turno' : 'Negras — Tu turno';

  const statusColor = isCheckmate || isGameOver || isCheck ? '#e05' : undefined;

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? 12 : 16,
      padding: isMobile ? 12 : 20,
      alignItems: 'flex-start',
      justifyContent: 'center',
      minHeight: '100vh',
      boxSizing: 'border-box',
    }}>

      {/* ── Panel izquierdo — Habilidades ── */}
      {!isMobile && hasAbilities && gameStarted && (
        <div style={{ width:200, display:'flex', flexDirection:'column', gap:10,
          position:'sticky', top:20 }}>
          <AbilityPanel
            game={game}
            civilization={civilization}
            abilities={abilities}
            selectedSquare={selectedSquare}
            playerColor="w"
            isPlayerTurn={turn === 'w' && !isAIThinking}
          />
        </div>
      )}

      {/* ── Tablero ── */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start' }}>
        <div style={{ display:'flex', gap:4 }}>
          {/* Rank coords */}
          <div style={{ display:'flex', flexDirection:'column' }}>
            {RANKS.map(r => (
              <span key={r} style={{
                height: squareSize, display:'flex', alignItems:'center',
                fontSize: isMobile ? 9 : 11, color:'#999',
                width: isMobile ? 10 : 14,
              }}>{r}</span>
            ))}
          </div>

          <div>
            <div
              key={shakeKey}
              style={{
                display:'grid',
                gridTemplateColumns: `repeat(8, ${squareSize}px)`,
                border:'2px solid #888', borderRadius:4, overflow:'hidden',
                width: boardPx, height: boardPx,
                animation: shakeKey > 0 ? 'shake 0.4s ease' : 'none',
                opacity: gameStarted ? 1 : 0.6,
                transition:'opacity 0.3s',
              }}
            >
              {RANKS.map((rank, ri) =>
                FILES.map((file, fi) => {
                  const sq = `${file}${rank}` as Square;
                  const piece = game.get(sq);
                  const isLight = (ri + fi) % 2 === 0;
                  const isSelected = selectedSquare === sq;
                  const isHint = legalMoves.includes(sq);
                  const isLastFrom = lastHistoryMove?.from === sq;
                  const isLastTo   = lastHistoryMove?.to === sq;
                  const isKingCheck = isCheck && piece?.type === 'k' && piece?.color === turn;
                  const isAoePreview = abilities.state.pendingAbility?.aoePreview.includes(sq) ?? false;
                  const isShielded = abilities.isShielded(sq);

                  return (
                    <SquareComponent
                      key={sq}
                      isLight={isLight}
                      isSelected={isSelected}
                      isHint={isHint}
                      isLastMove={isLastFrom || isLastTo}
                      isCheck={!!isKingCheck}
                      hasPiece={!!piece}
                      lightColor={civilization.board.light}
                      darkColor={civilization.board.dark}
                      size={squareSize}
                      isAoePreview={isAoePreview}
                      isShielded={isShielded}
                      onClick={() => handleSquareClick(sq)}
                    >
                      {piece && (
                        <Piece
                          code={(piece.color === 'w' ? 'w' : 'b') + piece.type.toUpperCase()}
                          size={squareSize}
                          civilization={civilization}
                        />
                      )}
                    </SquareComponent>
                  );
                })
              )}
            </div>

            {/* File coords */}
            <div style={{ display:'flex', width: boardPx }}>
              {FILES.map(f => (
                <span key={f} style={{
                  width: squareSize, textAlign:'center',
                  fontSize: isMobile ? 9 : 11, color:'#999', marginTop:3,
                }}>{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Habilidades en móvil — debajo del tablero */}
        {isMobile && hasAbilities && gameStarted && (
          <div style={{ marginTop:12, width: boardPx + 14 }}>
            <AbilityPanel
              game={game}
              civilization={civilization}
              abilities={abilities}
              selectedSquare={selectedSquare}
              playerColor="w"
              isPlayerTurn={turn === 'w' && !isAIThinking}
            />
          </div>
        )}
      </div>

      {/* ── Panel derecho ── */}
      <div style={{
        display:'flex', flexDirection:'column', gap:10,
        width: isMobile ? boardPx + 14 : 200,
      }}>
        <UserPanel onLogout={onLogout} />
        <ConfigPanel
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          civId={civId}
          setCivId={setCivId}
          civilizations={CIVILIZATIONS}
          gameStarted={gameStarted}
          configOpen={configOpen}
          setConfigOpen={setConfigOpen}
          onStart={handleStart}
        />
        {gameStarted && (
          <GamePanel
            statusText={statusText}
            statusColor={statusColor}
            isAIThinking={isAIThinking}
            blackTime={blackTime}
            whiteTime={whiteTime}
            turn={turn}
            gameStarted={gameStarted}
            isGameOver={isGameOver}
            history={history}
            isMobile={isMobile}
            onReset={handleReset}
          />
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}