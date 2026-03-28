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

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

interface BoardProps {
  onLogout?: () => void;
}

export function Board({ onLogout }: BoardProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const squareSize = useBoardSize();
  const moveLogRef = useRef<HTMLDivElement>(null);
  const [civId, setCivId] = useState('classic');
  const civilization: Civilization = CIVILIZATIONS[civId];

  const {
    game, selectedSquare, legalMoves,
    handleSquareClick, isCheck, isCheckmate,
    isGameOver, turn, history, isAIThinking,
    shakeKey, whiteTime, blackTime, reset,
  } = useChessGame(difficulty);

  const lastHistoryMove = game.history({ verbose: true }).slice(-1)[0];

  useEffect(() => {
    if (moveLogRef.current) {
      moveLogRef.current.scrollTop = moveLogRef.current.scrollHeight;
    }
  }, [history]);

  const boardPx = squareSize * 8;
  const isMobile = squareSize < 60;

  const statusText = isCheckmate
    ? `¡Jaque mate! Ganan ${turn === 'w' ? 'negras' : 'blancas'}`
    : isGameOver ? 'Tablas'
    : isAIThinking ? 'IA pensando...'
    : isCheck ? '¡Jaque!'
    : turn === 'w' ? 'Blancas — Tu turno' : 'Negras — Tu turno';

  const statusColor = isCheckmate || isGameOver || isCheck ? '#e05' : undefined;

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? 16 : 24,
      padding: isMobile ? 12 : 24,
      alignItems: isMobile ? 'center' : 'flex-start',
      justifyContent: 'center',
      minHeight: '100vh',
      boxSizing: 'border-box',
    }}>

      {/* ── Tablero ── */}
      <div style={{ display:'flex', gap:4 }}>
        {/* Rank coords */}
        <div style={{ display:'flex', flexDirection:'column' }}>
          {RANKS.map(r => (
            <span key={r} style={{
              height: squareSize, display:'flex', alignItems:'center',
              fontSize: isMobile ? 9 : 11, color:'#999', width: isMobile ? 10 : 14,
            }}>{r}</span>
          ))}
        </div>

        <div>
          {/* Grid con shake en jaque */}
          <div
            key={shakeKey}
            style={{
              display:'grid',
              gridTemplateColumns: `repeat(8, ${squareSize}px)`,
              border:'2px solid #888', borderRadius:4, overflow:'hidden',
              width: boardPx, height: boardPx,
              animation: shakeKey > 0 ? 'shake 0.4s ease' : 'none',
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

      {/* ── Panel lateral ── */}
      <UserPanel onLogout={onLogout} />
      <div style={{
        display:'flex', flexDirection:'column', gap:12,
        width: isMobile ? boardPx + 14 : 200,
      }}>

        {/* Estado */}
        <div style={{ background:'#f5f5f5', border:'0.5px solid #ddd',
          borderRadius:10, padding:'12px 14px' }}>
          <div style={{ fontSize:11, color:'#999', marginBottom:4, textTransform:'uppercase' }}>
            Estado
          </div>
          <div style={{ fontSize:14, fontWeight:500, color: statusColor }}>
            {isAIThinking
              ? <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ display:'inline-block', width:8, height:8,
                    borderRadius:'50%', background:'#888',
                    animation:'pulse 1s ease-in-out infinite' }} />
                  IA pensando...
                </span>
              : statusText}
          </div>
        </div>

        {/* Timer */}
        <div style={{ background:'#f5f5f5', border:'0.5px solid #ddd',
          borderRadius:10, padding:'12px 14px' }}>
          <div style={{ fontSize:11, color:'#999', marginBottom:8, textTransform:'uppercase' }}>
            Tiempo
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {[
              { label:'⬛ Negras', time: blackTime, active: turn === 'b' && !isGameOver },
              { label:'⬜ Blancas', time: whiteTime, active: turn === 'w' && !isGameOver },
            ].map(({ label, time, active }) => (
              <div key={label} style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'6px 10px', borderRadius:6,
                background: active ? '#1a1a1a' : 'transparent',
                color: active ? '#fff' : '#666', transition:'all 0.3s',
              }}>
                <span style={{ fontSize:12 }}>{label}</span>
                <span style={{ fontSize:14, fontWeight:500, fontVariantNumeric:'tabular-nums' }}>
                  {formatTime(time)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dificultad */}
        <div style={{ background:'#f5f5f5', border:'0.5px solid #ddd',
          borderRadius:10, padding:'12px 14px' }}>
          <div style={{ fontSize:11, color:'#999', marginBottom:8, textTransform:'uppercase' }}>
            Dificultad
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {(['easy','medium','hard'] as Difficulty[]).map(d => (
              <button key={d} onClick={() => setDifficulty(d)} style={{
                flex:1, padding:'6px 0', borderRadius:6,
                border:'0.5px solid #ddd',
                background: difficulty === d ? '#1a1a1a' : 'transparent',
                color: difficulty === d ? '#fff' : '#666',
                fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit',
                transition:'all 0.2s',
              }}>
                {d === 'easy' ? 'Fácil' : d === 'medium' ? 'Medio' : 'Difícil'}
              </button>
            ))}
          </div>
        </div>

        {/* Civilización */}
        <div style={{ background:'#f5f5f5', border:'0.5px solid #ddd',
          borderRadius:10, padding:'12px 14px' }}>
          <div style={{ fontSize:11, color:'#999', marginBottom:8, textTransform:'uppercase' }}>
            Civilización
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {Object.values(CIVILIZATIONS).map(civ => (
              <button key={civ.id} onClick={() => setCivId(civ.id)} style={{
                padding:'8px 10px', borderRadius:6, border:'0.5px solid #ddd',
                background: civId === civ.id ? '#1a1a1a' : 'transparent',
                color: civId === civ.id ? '#fff' : '#444',
                fontSize:12, fontWeight:500, cursor:'pointer',
                fontFamily:'inherit', textAlign:'left', transition:'all 0.2s',
              }}>
                <div>{civ.name} {civ.isPremium ? '👑' : ''}</div>
                <div style={{ fontSize:10, opacity:0.6, marginTop:2 }}>{civ.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Historial */}
        {!isMobile && (
          <div ref={moveLogRef} style={{ background:'#f5f5f5', border:'0.5px solid #ddd',
            borderRadius:10, padding:'12px 14px', maxHeight:200, overflowY:'auto' }}>
            <div style={{ fontSize:11, color:'#999', marginBottom:6, textTransform:'uppercase' }}>
              Movimientos
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'20px 1fr 1fr',
              gap:'2px 6px', fontSize:12 }}>
              {history.reduce((acc: string[][], mv, i) => {
                if (i % 2 === 0) acc.push([mv]);
                else acc[acc.length - 1].push(mv);
                return acc;
              }, []).map((pair, i) => (
                <span key={i} style={{ display:'contents' }}>
                  <span style={{ color:'#999' }}>{i+1}.</span>
                  <span>{pair[0]}</span>
                  <span>{pair[1] || ''}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {isMobile && history.length > 0 && (
          <div style={{ background:'#f5f5f5', border:'0.5px solid #ddd',
            borderRadius:10, padding:'8px 14px', fontSize:12, color:'#666',
            textAlign:'center' }}>
            {history.length} movimiento{history.length !== 1 ? 's' : ''}
          </div>
        )}

        <button onClick={reset} style={{
          background:'none', border:'0.5px solid #ccc', borderRadius:8,
          padding:'8px 12px', fontSize:13, fontWeight:500, cursor:'pointer',
          fontFamily:'inherit', transition:'background 0.12s',
        }}>
          ↺ Nueva partida
        </button>
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