// src/components/Board/Board.tsx
import type { Square } from 'chess.js';
import { Square as SquareComponent } from './Square';
import { Piece } from './Piece';
import { useChessGame } from '../../hooks/useChessGame';
import type { Difficulty, GameResult } from '../../hooks/useChessGame';
import { useGameRecord } from '../../hooks/useGameRecord';
import { useState, useEffect, useCallback } from 'react';
import { CIVILIZATIONS } from '../../civilizations';
import type { Civilization } from '../../types/civilization.types';
import { UserPanel } from '../Auth/UserPanel';
import { AbilityPanel } from '../Abilities/AbilityPanel';
import { ConfigPanel } from './ConfigPanel';
import { GamePanel } from './GamePanel';
import { formatTime } from '../../utils/formatTime';
import { zoneAt } from '../../core/zones';
import { PromotionPicker } from './PromotionPicker';
import { ZoneLegend } from './ZoneLegend';

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
  const civilization: Civilization = CIVILIZATIONS[civId] ?? CIVILIZATIONS['classic'];
  const { saveGame } = useGameRecord();

  // Guarda la partida en Firebase al terminar (si hay sesión iniciada)
  const handleGameEnd = useCallback((r: GameResult, info: { moves: number; durationSec: number }) => {
    const outcome = r.winner === null ? 'draw' : r.winner === 'w' ? 'win' : 'loss';
    saveGame(outcome, civId, info.moves, info.durationSec, difficulty).catch(err =>
      console.error('No se pudo guardar la partida:', err));
  }, [saveGame, civId, difficulty]);

  const {
    game, selectedSquare, legalMoves,
    handleSquareClick, isCheck, result,
    isGameOver, turn, log, lastMove, fx, isAIThinking,
    shakeKey, whiteTime, blackTime,
    gameStarted, startGame, canPlayerAct, abilities,
    activateAbility, confirmAbility, reset,
    pendingPromotion, choosePromotion, cancelPromotion,
  } = useChessGame(difficulty, civilization, selectedTime, handleGameEnd);

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
  const frame = squareSize < 50 ? 4 : 6;
  const isMobile = squareSize < 60;
  const hasAbilities = civilization.id !== 'classic';

  const statusText = result
    ? resultText(result)
    : !gameStarted ? 'Configura y pulsa Jugar'
    : isAIThinking ? 'IA pensando...'
    : isCheck ? '¡Jaque!'
    : 'Blancas — Tu turno';

  const statusColor = result
    ? (result.winner === 'w' ? '#16a34a' : result.winner === 'b' ? '#e05' : '#b45309')
    : isCheck ? '#e05' : undefined;

  const shields = abilities.state.shields;
  const pending = abilities.state.pending;
  const abilityPanel = (
    <AbilityPanel
      game={game}
      civilization={civilization}
      abilities={abilities}
      selectedSquare={selectedSquare}
      canAct={canPlayerAct}
      onActivate={activateAbility}
      onConfirm={confirmAbility}
    />
  );

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
          {abilityPanel}
        </div>
      )}

      {/* ── Tablero ── */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start' }}>
        {/* Barra compacta de estado y relojes (solo móvil) */}
        {isMobile && gameStarted && (
          <div style={{
            width: boardPx + frame * 2 + 14, boxSizing: 'border-box', marginBottom: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            padding: '6px 10px', borderRadius: 8, background: '#f5f5f5', border: '0.5px solid #ddd',
          }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: statusColor ?? '#333', textAlign: 'left' }}>
              {statusText}
            </span>
            <span style={{ display: 'flex', gap: 6, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
              {([['⬜', whiteTime, 'w'], ['⬛', blackTime, 'b']] as const).map(([icon, t, side]) => (
                <span key={side} style={{
                  padding: '2px 6px', borderRadius: 5,
                  background: turn === side && !result ? '#1a1a1a' : 'transparent',
                  color: turn === side && !result ? '#fff' : t < 30 ? '#e05' : '#666',
                }}>{icon} {formatTime(t)}</span>
              ))}
            </span>
          </div>
        )}
        <div style={{ display:'flex', gap:4 }}>
          {/* Rank coords */}
          <div style={{ display:'flex', flexDirection:'column', paddingTop: frame }}>
            {RANKS.map(r => (
              <span key={r} style={{
                height: squareSize, display:'flex', alignItems:'center',
                fontSize: isMobile ? 9 : 11, color: civilization.board.coordColor ?? '#999',
                width: isMobile ? 10 : 14,
              }}>{r}</span>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            <div
              key={shakeKey}
              style={{
                display:'grid',
                gridTemplateColumns: `repeat(8, ${squareSize}px)`,
                border: `${frame}px solid ${civilization.board.borderColor ?? '#888'}`,
                borderRadius: 6, overflow:'hidden',
                boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
                width: boardPx + frame * 2, height: boardPx + frame * 2,
                boxSizing: 'border-box',
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
                  const isLastMove = lastMove?.from === sq || lastMove?.to === sq;
                  const isKingCheck = isCheck && piece?.type === 'k' && piece?.color === turn;
                  const isAoePreview = pending?.preview.includes(sq) ?? false;
                  const isTarget = pending?.targets.includes(sq) ?? false;

                  return (
                    <SquareComponent
                      key={sq}
                      square={sq}
                      isLight={isLight}
                      isSelected={isSelected}
                      isHint={isHint}
                      isLastMove={isLastMove}
                      isCheck={!!isKingCheck}
                      hasPiece={!!piece}
                      lightColor={civilization.board.light}
                      darkColor={civilization.board.dark}
                      lightTexture={civilization.board.lightTexture}
                      darkTexture={civilization.board.darkTexture}
                      size={squareSize}
                      isAoePreview={isAoePreview}
                      isTarget={isTarget}
                      shieldTurns={shields[sq]?.turns ?? 0}
                      shieldSide={shields[sq]?.side}
                      zone={zoneAt(civilization, sq)}
                      fx={fx && fx.squares.includes(sq) ? fx : null}
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

            {/* Elegir pieza al coronar */}
            {pendingPromotion && (
              <PromotionPicker
                civilization={civilization}
                size={squareSize}
                onChoose={choosePromotion}
                onCancel={cancelPromotion}
              />
            )}

            {/* File coords */}
            <div style={{ display:'flex', width: boardPx, marginLeft: frame }}>
              {FILES.map(f => (
                <span key={f} style={{
                  width: squareSize, textAlign:'center',
                  fontSize: isMobile ? 9 : 11, color: civilization.board.coordColor ?? '#999', marginTop:3,
                }}>{f}</span>
              ))}
            </div>

            {/* Leyenda de zonas especiales */}
            {civilization.boardZones?.length ? (
              <ZoneLegend zones={civilization.boardZones} width={boardPx + frame * 2} />
            ) : null}

            {/* Resultado de la partida */}
            {result && (
              <div style={{
                marginTop: 10, width: boardPx + frame * 2, boxSizing: 'border-box',
                padding: '12px 14px', borderRadius: 10, textAlign: 'center',
                background: result.winner === 'w' ? '#f0fdf4' : result.winner === 'b' ? '#fef2f2' : '#fffbeb',
                border: `0.5px solid ${result.winner === 'w' ? '#86efac' : result.winner === 'b' ? '#fecaca' : '#fcd34d'}`,
              }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: statusColor }}>
                  {result.winner === 'w' ? '🏆 ¡Victoria!' : result.winner === 'b' ? 'Derrota' : 'Tablas'}
                </div>
                <div style={{ fontSize: 12, color: '#666', margin: '2px 0 8px' }}>{resultText(result)}</div>
                <button onClick={handleReset} style={{
                  padding: '7px 16px', borderRadius: 8, border: 'none', background: '#1a1a1a',
                  color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                }}>↺ Jugar otra</button>
              </div>
            )}
          </div>
        </div>

        {/* Habilidades en móvil — debajo del tablero */}
        {isMobile && hasAbilities && gameStarted && (
          <div style={{ marginTop:12, width: boardPx + 14 }}>
            {abilityPanel}
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
            log={log}
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
        @keyframes shieldPulse {
          0%, 100% { opacity: 0.75; transform: scale(0.92); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes targetPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes fxBurst {
          0% { opacity: 1; transform: scale(0.4); }
          100% { opacity: 0; transform: scale(1.4); }
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
function resultText(r: GameResult): string {
  if (r.reason === 'checkmate') return `Jaque mate — ganan ${r.winner === 'w' ? 'blancas' : 'negras'}`;
  if (r.reason === 'timeout') return `Se acabó el tiempo de ${r.winner === 'w' ? 'negras' : 'blancas'}`;
  if (r.reason === 'stalemate') return 'Rey ahogado';
  return 'Tablas';
}
