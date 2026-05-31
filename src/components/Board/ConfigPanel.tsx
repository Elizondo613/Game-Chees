import type { Difficulty } from '../../hooks/useChessGame';
import type { Civilization } from '../../types/civilization.types';

const TIME_OPTIONS = [
  { label: '5 min',  seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '20 min', seconds: 1200 },
  { label: '30 min', seconds: 1800 },
];

interface ConfigPanelProps {
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  selectedTime: number;
  setSelectedTime: (t: number) => void;
  civId: string;
  setCivId: (id: string) => void;
  civilizations: Record<string, Civilization>;
  gameStarted: boolean;
  configOpen: boolean;
  setConfigOpen: (o: boolean) => void;
  onStart: () => void;
}

export function ConfigPanel({
  difficulty, setDifficulty, selectedTime, setSelectedTime,
  civId, setCivId, civilizations, gameStarted,
  configOpen, setConfigOpen, onStart,
}: ConfigPanelProps) {
  return (
    <div style={{ background:'#f5f5f5', border:'0.5px solid #ddd',
      borderRadius:10, overflow:'hidden' }}>
      <button
        onClick={() => setConfigOpen(!configOpen)}
        style={{ width:'100%', padding:'10px 14px',
          display:'flex', justifyContent:'space-between', alignItems:'center',
          background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}
      >
        <span style={{ fontSize:11, color:'#999', textTransform:'uppercase',
          letterSpacing:'0.04em' }}>Configuración</span>
        <span style={{ fontSize:14, color:'#999', transition:'transform 0.2s',
          display:'inline-block',
          transform: configOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
      </button>

      {configOpen && (
        <div style={{ padding:'0 14px 14px', display:'flex',
          flexDirection:'column', gap:12 }}>

          {/* Tiempo */}
          <div>
            <div style={{ fontSize:11, color:'#999', marginBottom:6,
              textTransform:'uppercase' }}>Tiempo por jugador</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5 }}>
              {TIME_OPTIONS.map(opt => (
                <button key={opt.seconds} onClick={() => setSelectedTime(opt.seconds)}
                  disabled={gameStarted} style={{
                    padding:'7px 0', borderRadius:6, border:'0.5px solid #ddd',
                    background: selectedTime === opt.seconds ? '#1a1a1a' : 'transparent',
                    color: selectedTime === opt.seconds ? '#fff' : '#666',
                    fontSize:12, fontWeight:500,
                    cursor: gameStarted ? 'default' : 'pointer',
                    fontFamily:'inherit', opacity: gameStarted ? 0.5 : 1,
                  }}>{opt.label}</button>
              ))}
            </div>
          </div>

          {/* Dificultad */}
          <div>
            <div style={{ fontSize:11, color:'#999', marginBottom:6,
              textTransform:'uppercase' }}>Dificultad</div>
            <div style={{ display:'flex', gap:5 }}>
              {(['easy','medium','hard'] as Difficulty[]).map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  disabled={gameStarted} style={{
                    flex:1, padding:'7px 0', borderRadius:6, border:'0.5px solid #ddd',
                    background: difficulty === d ? '#1a1a1a' : 'transparent',
                    color: difficulty === d ? '#fff' : '#666',
                    fontSize:12, fontWeight:500,
                    cursor: gameStarted ? 'default' : 'pointer',
                    fontFamily:'inherit', opacity: gameStarted ? 0.5 : 1,
                  }}>
                  {d === 'easy' ? 'Fácil' : d === 'medium' ? 'Medio' : 'Difícil'}
                </button>
              ))}
            </div>
          </div>

          {/* Civilización */}
          <div>
            <div style={{ fontSize:11, color:'#999', marginBottom:6,
              textTransform:'uppercase' }}>Civilización</div>
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              {Object.values(civilizations).map(civ => (
                <button key={civ.id} onClick={() => setCivId(civ.id)}
                  disabled={gameStarted} style={{
                    padding:'7px 10px', borderRadius:6, border:'0.5px solid #ddd',
                    background: civId === civ.id ? '#1a1a1a' : 'transparent',
                    color: civId === civ.id ? '#fff' : '#444',
                    fontSize:12, fontWeight:500,
                    cursor: gameStarted ? 'default' : 'pointer',
                    fontFamily:'inherit', textAlign:'left',
                    opacity: gameStarted ? 0.5 : 1,
                  }}>
                  <div>{civ.name} {civ.isPremium ? '👑' : ''}</div>
                  <div style={{ fontSize:10, opacity:0.6, marginTop:1 }}>
                    {civ.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {!gameStarted && (
            <button onClick={onStart} style={{
              padding:'10px 0', borderRadius:8, border:'none',
              background:'#1a1a1a', color:'#fff',
              fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'inherit',
            }}>▶ Jugar</button>
          )}
        </div>
      )}
    </div>
  );
}