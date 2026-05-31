import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import type { Civilization } from '../../types/civilization.types';
import type { useAbilities } from '../../hooks/useAbilities';

type AbilitiesHook = ReturnType<typeof useAbilities>;

interface AbilityPanelProps {
  game: Chess;
  civilization: Civilization;
  abilities: AbilitiesHook;
  selectedSquare: Square | null;
  playerColor: 'w' | 'b';
  isPlayerTurn: boolean;
}

export function AbilityPanel({
  game, civilization, abilities,
  selectedSquare, playerColor, isPlayerTurn,
}: AbilityPanelProps) {
  const { state, startAbility, cancelAbility, getCooldown, canUseAbility } = abilities;

  // Solo piezas con habilidad activa, sin duplicados por tipo
  const piecesWithAbility = civilization.pieces.filter(p => p.activeAbility);

  // Pieza seleccionada
  const selectedPiece = selectedSquare ? game.get(selectedSquare) : null;
  const selectedCivPiece = selectedPiece
    ? civilization.pieces.find(p => p.replaces === selectedPiece.type.toUpperCase())
    : null;
  const showSelected = selectedCivPiece?.activeAbility
    && selectedPiece?.color === playerColor
    && selectedSquare;

  return (
    <div style={{ background:'#f5f5f5', border:'0.5px solid #ddd',
      borderRadius:10, padding:'12px 14px',
      display:'flex', flexDirection:'column', gap:10 }}>

      <div style={{ fontSize:11, color:'#999',
        textTransform:'uppercase', letterSpacing:'0.04em' }}>
        Habilidades
      </div>

      {/* Tarjeta de pieza seleccionada */}
      {showSelected && selectedSquare && (() => {
        const ability = selectedCivPiece!.activeAbility!;
        const cd = getCooldown(selectedSquare);
        const available = canUseAbility(selectedSquare) && isPlayerTurn;
        const isPending = state.pendingAbility?.fromSquare === selectedSquare;
        const isShieldedNow = abilities.isShielded(selectedSquare);

        return (
          <div style={{ background:'#fff', border:'0.5px solid #ddd',
            borderRadius:8, padding:'10px 12px' }}>
            <div style={{ display:'flex', alignItems:'center',
              gap:6, marginBottom:8 }}>
              <span style={{ fontSize:13 }}>{ability.icon}</span>
              <span style={{ fontSize:13, fontWeight:500, color:'#1a1a1a' }}>
                {selectedCivPiece!.name}
              </span>
              {isShieldedNow && (
                <span style={{ fontSize:10, background:'#fef9c3',
                  color:'#854d0e', padding:'2px 6px', borderRadius:4,
                  fontWeight:500 }}>🛡️ Protegida</span>
              )}
            </div>

            <div style={{ background: available ? '#fff' : '#f5f5f5',
              border:`0.5px solid ${available ? '#93c5fd' : '#ddd'}`,
              borderRadius:6, padding:'8px 10px',
              opacity: available || isPending ? 1 : 0.7 }}>

              <div style={{ display:'flex', justifyContent:'space-between',
                alignItems:'center', marginBottom:4 }}>
                <span style={{ fontSize:12, fontWeight:500, color:'#1a1a1a' }}>
                  {ability.name}
                </span>
                <span style={{ fontSize:10, fontWeight:500,
                  color: cd === 0 ? '#16a34a' : '#999' }}>
                  {cd === 0 ? 'Disponible' : `${cd} turnos`}
                </span>
              </div>

              <p style={{ margin:'0 0 8px', fontSize:11,
                color:'#666', lineHeight:1.4 }}>
                {ability.description}
              </p>

              {/* Barra de cooldown */}
              {cd > 0 && (
                <div style={{ height:3, background:'#e5e7eb',
                  borderRadius:2, marginBottom:8, overflow:'hidden' }}>
                  <div style={{
                    height:'100%', borderRadius:2, background:'#3b82f6',
                    width:`${((ability.cooldownTurns - cd) / ability.cooldownTurns) * 100}%`,
                    transition:'width 0.3s',
                  }} />
                </div>
              )}

              {available && !isPending && (
                <button
                  onClick={() => startAbility(selectedSquare, ability)}
                  style={{ width:'100%', padding:'6px 0', borderRadius:5,
                    border:'none', background:'#1a1a1a', color:'#fff',
                    fontSize:12, fontWeight:500, cursor:'pointer',
                    fontFamily:'inherit' }}>
                  ⚡ Activar
                </button>
              )}
              {isPending && (
                <button onClick={cancelAbility}
                  style={{ width:'100%', padding:'6px 0', borderRadius:5,
                    border:'none', background:'#ef4444', color:'#fff',
                    fontSize:12, fontWeight:500, cursor:'pointer',
                    fontFamily:'inherit' }}>
                  ✕ Cancelar
                </button>
              )}
              {!available && !isPending && cd === 0 && (
                <div style={{ fontSize:11, color:'#999', textAlign:'center' }}>
                  Selecciona esta pieza para activar
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Resumen — un item por tipo de pieza, sin duplicados */}
      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
        {piecesWithAbility.map(civPiece => {
          const ability = civPiece.activeAbility!;

          // Busca la PRIMERA pieza de este tipo en el tablero
          const allSquares = (['a','b','c','d','e','f','g','h'] as const)
            .flatMap(f => ['1','2','3','4','5','6','7','8']
              .map(r => f + r))
            .filter(sq => {
              const p = game.get(sq as Square);
              return p && p.color === playerColor
                && p.type.toUpperCase() === civPiece.replaces;
            });

          // Si no hay ninguna en el tablero — capturadas
          if (allSquares.length === 0) {
            return (
              <div key={civPiece.role} style={{
                display:'flex', alignItems:'center', gap:8,
                padding:'5px 8px', background:'#f5f5f5',
                borderRadius:6, opacity:0.4 }}>
                <span style={{ fontSize:14 }}>{ability.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:500,
                    color:'#1a1a1a' }}>{ability.name}</div>
                  <div style={{ fontSize:10, color:'#999' }}>
                    {civPiece.name} — capturada
                  </div>
                </div>
                <span style={{ fontSize:10, color:'#999' }}>—</span>
              </div>
            );
          }

          // ✅ Muestra solo UNA entrada por tipo
          // Usa el mejor estado entre todas las piezas de ese tipo
          const bestSquare = allSquares.reduce((best, sq) => {
            const cdBest = getCooldown(best);
            const cdSq = getCooldown(sq);
            return cdSq < cdBest ? sq : best;
          }, allSquares[0]);

          const cd = getCooldown(bestSquare);
          const available = cd === 0;
          const count = allSquares.length;

          return (
            <div key={civPiece.role} style={{
              display:'flex', alignItems:'center', gap:8,
              padding:'6px 8px',
              background: available ? '#f0fdf4' : '#f5f5f5',
              borderRadius:6 }}>
              <span style={{ fontSize:14 }}>{ability.icon}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <span style={{ fontSize:11, fontWeight:500,
                    color:'#1a1a1a' }}>{ability.name}</span>
                  {count > 1 && (
                    <span style={{ fontSize:10, background:'#e5e7eb',
                      color:'#666', padding:'1px 5px',
                      borderRadius:3 }}>x{count}</span>
                  )}
                </div>
                <div style={{ fontSize:10, color:'#999' }}>
                  {civPiece.name}
                  {count > 1 ? ` — ${count} en tablero` : ` en ${bestSquare}`}
                </div>
                {cd > 0 && (
                  <div style={{ height:2, background:'#e5e7eb',
                    borderRadius:1, marginTop:3, overflow:'hidden' }}>
                    <div style={{
                      height:'100%', background:'#3b82f6', borderRadius:1,
                      width:`${((ability.cooldownTurns-cd)/ability.cooldownTurns)*100}%`,
                    }} />
                  </div>
                )}
              </div>
              <span style={{ fontSize:10, fontWeight:500, flexShrink:0,
                color: available ? '#16a34a' : '#999' }}>
                {available ? 'Listo' : `${cd}t`}
              </span>
            </div>
          );
        })}
      </div>

      {!selectedSquare && isPlayerTurn && (
        <p style={{ margin:0, fontSize:11, color:'#999',
          textAlign:'center', lineHeight:1.4 }}>
          Selecciona una pieza para ver y activar su habilidad
        </p>
      )}
    </div>
  );
}