import { useRef, useEffect } from 'react';

interface GamePanelProps {
  statusText: string;
  statusColor: string | undefined;
  isAIThinking: boolean;
  blackTime: number;
  whiteTime: number;
  turn: string;
  gameStarted: boolean;
  isGameOver: boolean;
  history: string[];
  isMobile: boolean;
  onReset: () => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function GamePanel({
  statusText, statusColor, isAIThinking,
  blackTime, whiteTime, turn, gameStarted,
  isGameOver, history, isMobile, onReset,
}: GamePanelProps) {
  const moveLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (moveLogRef.current) {
      moveLogRef.current.scrollTop = moveLogRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <>
      {/* Estado */}
      <div style={{ background:'#f5f5f5', border:'0.5px solid #ddd',
        borderRadius:10, padding:'12px 14px' }}>
        <div style={{ fontSize:11, color:'#999', marginBottom:4,
          textTransform:'uppercase' }}>Estado</div>
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
        <div style={{ fontSize:11, color:'#999', marginBottom:8,
          textTransform:'uppercase' }}>Tiempo</div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {[
            { label:'⬛ Negras', time: blackTime, active: turn === 'b' && gameStarted && !isGameOver },
            { label:'⬜ Blancas', time: whiteTime, active: turn === 'w' && gameStarted && !isGameOver },
          ].map(({ label, time, active }) => (
            <div key={label} style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'6px 10px', borderRadius:6,
              background: active ? '#1a1a1a' : 'transparent',
              color: active ? '#fff' : '#666', transition:'all 0.3s',
            }}>
              <span style={{ fontSize:12 }}>{label}</span>
              <span style={{ fontSize:14, fontWeight:500,
                fontVariantNumeric:'tabular-nums',
                color: time < 30 ? '#e05' : 'inherit' }}>
                {formatTime(time)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Historial */}
      {!isMobile && (
        <div ref={moveLogRef} style={{ background:'#f5f5f5', border:'0.5px solid #ddd',
          borderRadius:10, padding:'12px 14px', maxHeight:160, overflowY:'auto' }}>
          <div style={{ fontSize:11, color:'#999', marginBottom:6,
            textTransform:'uppercase' }}>Movimientos</div>
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

      <button onClick={onReset} style={{
        background:'none', border:'0.5px solid #ccc', borderRadius:8,
        padding:'8px 12px', fontSize:13, fontWeight:500, cursor:'pointer',
        fontFamily:'inherit',
      }}>↺ Nueva partida</button>
    </>
  );
}