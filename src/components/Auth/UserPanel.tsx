// src/components/Auth/UserPanel.tsx
import { useAuth } from '../../context/AuthContext';

interface UserPanelProps {
  onLogout?: () => void;
}

export function UserPanel({ onLogout }: UserPanelProps) {
  const { profile, logout } = useAuth();
  if (!profile) return null;

  async function handleLogout() {
    await logout();
    onLogout?.();
  }

  if (!profile) return (
    <div style={{ background:'#f5f5f5', border:'0.5px solid #ddd',
      borderRadius:10, padding:'12px 14px' }}>
      <div style={{ fontSize:13, color:'#999', marginBottom:8 }}>
        Jugando como invitado
      </div>
      <button onClick={onLogout} style={{
        width:'100%', padding:'7px 0', borderRadius:6,
        border:'0.5px solid #ddd', background:'transparent',
        fontSize:12, color:'#999', cursor:'pointer', fontFamily:'inherit',
      }}>
        Iniciar sesión
      </button>
    </div>
  );

  const { stats } = profile;
  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.wins / stats.gamesPlayed) * 100)
    : 0;

  return (
    <div style={{ background:'#f5f5f5', border:'0.5px solid #ddd',
      borderRadius:10, padding:'12px 14px' }}>

      {/* Avatar y nombre */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
        <div style={{ width:36, height:36, borderRadius:'50%',
          background:'#1a1a1a', display:'flex', alignItems:'center',
          justifyContent:'center', fontSize:16, color:'#fff', flexShrink:0 }}>
          {profile.displayName[0].toUpperCase()}
        </div>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:500, color:'#1a1a1a',
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {profile.displayName}
          </div>
          <div style={{ fontSize:11, color:'#999' }}>
            {stats.gamesPlayed} partidas jugadas
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr',
        gap:6, marginBottom:10 }}>
        {[
          { label:'Victorias', value: stats.wins, color:'#22c55e' },
          { label:'Derrotas',  value: stats.losses, color:'#ef4444' },
          { label:'Tablas',    value: stats.draws, color:'#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign:'center', padding:'6px 4px',
            background:'#fff', borderRadius:6, border:'0.5px solid #eee' }}>
            <div style={{ fontSize:16, fontWeight:600, color }}>{value}</div>
            <div style={{ fontSize:10, color:'#999' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Win rate y racha */}
      <div style={{ display:'flex', justifyContent:'space-between',
        fontSize:12, color:'#666', marginBottom:10 }}>
        <span>Win rate: <strong style={{ color:'#1a1a1a' }}>{winRate}%</strong></span>
        <span>Racha: <strong style={{ color:'#1a1a1a' }}>🔥 {stats.streak}</strong></span>
      </div>

      <button onClick={handleLogout} style={{
        width:'100%', padding:'7px 0', borderRadius:6,
        border:'0.5px solid #ddd', background:'transparent',
        fontSize:12, color:'#999', cursor:'pointer', fontFamily:'inherit',
      }}>
        Cerrar sesión
      </button>
    </div>
  );
}