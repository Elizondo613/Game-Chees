import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Board } from './components/Board/Board';
import { AuthScreen } from './components/Auth/AuthScreen';

function AppContent() {
  const { user, loading } = useAuth();
  const [playAsGuest, setPlayAsGuest] = useState(false);

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex',
      alignItems:'center', justifyContent:'center', fontSize:24 }}>
      ♟️
    </div>
  );

  if (user || playAsGuest) return <Board onLogout={() => setPlayAsGuest(false)} />;

  return <AuthScreen onGuest={() => setPlayAsGuest(true)} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;