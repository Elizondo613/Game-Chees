// src/components/Auth/AuthScreen.tsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface AuthScreenProps {
  onGuest: () => void;
}

export function AuthScreen({ onGuest }: AuthScreenProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) { setError('El nombre es requerido'); return; }
        if (password.length < 6) { setError('Mínimo 6 caracteres'); return; }
        await register(email, password, name);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      if (msg.includes('user-not-found') || msg.includes('wrong-password'))
        setError('Email o contraseña incorrectos');
      else if (msg.includes('email-already-in-use'))
        setError('Este email ya está registrado');
      else setError('Algo salió mal, intenta de nuevo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'#f8f6f0',
    }}>
      <div style={{
        background:'#fff', borderRadius:16, padding:'32px 28px',
        width:'100%', maxWidth:360,
        border:'0.5px solid #e0ddd8', boxShadow:'0 4px 24px rgba(0,0,0,0.06)',
      }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>♟️</div>
          <h1 style={{ fontSize:20, fontWeight:600, margin:0, color:'#1a1a1a' }}>
            Chess Civilizations
          </h1>
          <p style={{ fontSize:13, color:'#999', margin:'4px 0 0' }}>
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', background:'#f5f5f5',
          borderRadius:8, padding:3, marginBottom:20 }}>
          {(['login','register'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
              flex:1, padding:'7px 0', borderRadius:6, border:'none',
              background: mode === m ? '#fff' : 'transparent',
              color: mode === m ? '#1a1a1a' : '#999',
              fontSize:13, fontWeight:500, cursor:'pointer',
              boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition:'all 0.2s', fontFamily:'inherit',
            }}>
              {m === 'login' ? 'Entrar' : 'Registrarse'}
            </button>
          ))}
        </div>

        {/* Campos */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {mode === 'register' && (
            <input
              placeholder="Tu nombre"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ padding:'10px 12px', borderRadius:8,
                border:'0.5px solid #ddd', fontSize:14, fontFamily:'inherit',
                outline:'none', transition:'border 0.2s' }}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ padding:'10px 12px', borderRadius:8,
              border:'0.5px solid #ddd', fontSize:14, fontFamily:'inherit',
              outline:'none' }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{ padding:'10px 12px', borderRadius:8,
              border:'0.5px solid #ddd', fontSize:14, fontFamily:'inherit',
              outline:'none' }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginTop:10, padding:'8px 12px', borderRadius:8,
            background:'#fff0f0', border:'0.5px solid #ffcccc',
            fontSize:13, color:'#cc3333' }}>
            {error}
          </div>
        )}

        {/* Botón */}
        <button onClick={handleSubmit} disabled={loading} style={{
          marginTop:16, width:'100%', padding:'11px 0', borderRadius:8,
          background: loading ? '#ccc' : '#1a1a1a', color:'#fff',
          border:'none', fontSize:14, fontWeight:500, cursor: loading ? 'default' : 'pointer',
          fontFamily:'inherit', transition:'background 0.2s',
        }}>
          {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>

        {/* Jugar sin cuenta */}
        <button onClick={onGuest} style={{
          marginTop:10, width:'100%', padding:'10px 0', borderRadius:8,
          background:'transparent', color:'#999',
          border:'0.5px solid #e0ddd8', fontSize:13, cursor:'pointer',
          fontFamily:'inherit',
        }}>
          Jugar sin cuenta
        </button>
      </div>
    </div>
  );
}