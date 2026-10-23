// src/assets/svg/egypt-pieces.ts
// Reino de Kemet: marfil y lapislázuli (blancas) vs obsidiana y oro (negras)

const pal = (w: boolean) => ({
  fill: w ? '#fbf4e2' : '#1e1b2e',
  stroke: w ? '#4a2f0f' : '#e9c46a',
  gold: w ? '#d4a017' : '#e9c46a',
  accent: w ? '#1f4e9c' : '#2fb3a3',
});

const wrap = (body: string) =>
  `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

export const egyptSVGs = {
  // Faraón: nemes a rayas, uraeus y barba ceremonial
  Pharaoh: (w: boolean) => {
    const c = pal(w);
    return wrap(`
    <g stroke="${c.stroke}" stroke-width="1.4" stroke-linejoin="round">
      <path d="M22.5 4 C15 4 11 9 11 16 L9 31 L15 29 L16 21 L29 21 L30 29 L36 31 L34 16 C34 9 30 4 22.5 4 Z" fill="${c.fill}"/>
      <path d="M13 12 L32 12 M12 16 L33 16 M10.5 24 L15.5 23 M34.5 24 L29.5 23 M9.8 28 L15.2 27 M35.2 28 L29.8 27" stroke="${c.accent}" stroke-width="1.6"/>
      <path d="M22.5 4 L24.5 8 L22.5 10 L20.5 8 Z" fill="${c.gold}"/>
      <path d="M17 15 L28 15 L27 23 C27 26 25 27 22.5 27 C20 27 18 26 18 23 Z" fill="${c.fill}"/>
      <path d="M21 27 L24 27 L23.5 32 L21.5 32 Z" fill="${c.gold}"/>
      <path d="M12 36 L33 36 L35 41 L10 41 Z" fill="${c.fill}"/>
      <path d="M11.5 38.5 L33.5 38.5" stroke="${c.gold}" stroke-width="1.6"/>
    </g>`);
  },

  // Hechicera de Isis: disco solar entre cuernos
  Isis: (w: boolean) => {
    const c = pal(w);
    return wrap(`
    <g stroke="${c.stroke}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
      <path d="M14 4 C14 10 18 13 22.5 13 C27 13 31 10 31 4" fill="none" stroke-width="2"/>
      <circle cx="22.5" cy="7.5" r="4" fill="${c.gold}"/>
      <circle cx="22.5" cy="18" r="4.5" fill="${c.fill}"/>
      <path d="M18 17 C17 22 16 25 15 27 L30 27 C29 25 28 22 27 17" fill="${c.fill}"/>
      <path d="M15 27 C12 31 12 35 13 38 L32 38 C33 35 33 31 30 27 Z" fill="${c.fill}"/>
      <path d="M16 31 L29 31" stroke="${c.accent}" stroke-width="1.8"/>
      <path d="M11 38 L34 38 L35 41 L10 41 Z" fill="${c.fill}"/>
    </g>`);
  },

  // Esfinge: recostada sobre un pedestal
  Sphinx: (w: boolean) => {
    const c = pal(w);
    return wrap(`
    <g stroke="${c.stroke}" stroke-width="1.4" stroke-linejoin="round">
      <path d="M8 33 L8 26 C8 22 11 20 15 20 L26 20 L27 13 C27 9 30 7 33 7 C36 7 38 9 38 13 L38 24 L36 33 Z" fill="${c.fill}"/>
      <path d="M27 13 L26 21 L30 22 M38 13 L39 22 L36 23" fill="${c.fill}"/>
      <path d="M28.5 12 L37 12 M28 15 L37.5 15" stroke="${c.accent}" stroke-width="1.4"/>
      <circle cx="33" cy="11" r="0.9" fill="${c.stroke}" stroke="none"/>
      <path d="M30 33 L38 33 L38 31 L31 30 Z" fill="${c.fill}"/>
      <path d="M6 33 L39 33 L39 37 L6 37 Z" fill="${c.fill}"/>
      <path d="M5 37 L40 37 L40 41 L5 41 Z" fill="${c.gold}"/>
    </g>`);
  },

  // Sacerdote de Anubis: cabeza de chacal y ankh
  Anubis: (w: boolean) => {
    const c = pal(w);
    return wrap(`
    <g stroke="${c.stroke}" stroke-width="1.4" stroke-linejoin="round">
      <path d="M17 4 L19.5 13 L16 13 Z M28 4 L25.5 13 L29 13 Z" fill="${c.fill}"/>
      <path d="M16 13 C15 17 16 20 19 21 L26 20 L33 21 L33 18 L28 16 L29 13 Z" fill="${c.fill}"/>
      <circle cx="23.5" cy="15.5" r="0.9" fill="${c.stroke}" stroke="none"/>
      <path d="M16 21 L29 21 L30 25 L15 25 Z" fill="${c.gold}"/>
      <path d="M15 25 C13 30 13 34 14 38 L31 38 C32 34 32 30 30 25 Z" fill="${c.fill}"/>
      <ellipse cx="22.5" cy="28.6" rx="1.9" ry="2.3" fill="none" stroke="${c.gold}" stroke-width="1.5"/>
      <path d="M22.5 31 L22.5 36 M19.6 31.2 L25.4 31.2" stroke="${c.gold}" stroke-width="1.6"/>
      <path d="M12 38 L33 38 L34 41 L11 41 Z" fill="${c.fill}"/>
    </g>`);
  },

  // Carro de guerra: caballo con penacho y rueda
  Chariot: (w: boolean) => {
    const c = pal(w);
    return wrap(`
    <g stroke="${c.stroke}" stroke-width="1.4" stroke-linejoin="round">
      <path d="M14 7 L18 3 L19 8" fill="${c.accent}"/>
      <path d="M12 30 C10 24 11 16 15 11 C18 7 23 6 26 8 L33 14 C35 16 34 19 32 19 L27 17 C26 21 28 24 31 27 L30 30 Z" fill="${c.fill}"/>
      <circle cx="22" cy="12" r="1" fill="${c.stroke}" stroke="none"/>
      <path d="M15 13 C14 17 14 22 16 26" fill="none" stroke="${c.gold}" stroke-width="1.6"/>
      <circle cx="28" cy="34" r="6" fill="${c.fill}"/>
      <path d="M28 28 L28 40 M22 34 L34 34 M23.8 29.8 L32.2 38.2 M32.2 29.8 L23.8 38.2" stroke-width="1.1"/>
      <circle cx="28" cy="34" r="1.6" fill="${c.gold}"/>
      <path d="M9 30 L22 30 L21 41 L9 41 Z" fill="${c.fill}"/>
    </g>`);
  },

  // Lancero del Nilo: tocado rayado y lanza
  Spearman: (w: boolean) => {
    const c = pal(w);
    return wrap(`
    <g stroke="${c.stroke}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
      <path d="M33 5 L33 38" stroke-width="1.6"/>
      <path d="M31 9 L33 3 L35 9 Z" fill="${c.gold}"/>
      <path d="M17 10 C17 6 28 6 28 10 L29 17 L16 17 Z" fill="${c.fill}"/>
      <path d="M17 12 L28 12" stroke="${c.accent}" stroke-width="1.6"/>
      <circle cx="22.5" cy="15.5" r="4" fill="${c.fill}"/>
      <path d="M17 20 L28 20 L30 31 L15 31 Z" fill="${c.fill}"/>
      <path d="M16.5 26 L28.5 26" stroke="${c.gold}" stroke-width="1.6"/>
      <path d="M12 35 L33 35 L34 41 L11 41 Z" fill="${c.fill}"/>
      <path d="M15 31 L30 31 L32 35 L13 35 Z" fill="${c.fill}"/>
    </g>`);
  },
};
