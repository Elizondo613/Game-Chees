// src/assets/svg/japan-pieces.ts
// Shogunato: papel de arroz y laca roja (blancas) vs tinta negra (negras)

const pal = (w: boolean) => ({
  fill: w ? '#fbf7ef' : '#1b1b1f',
  stroke: w ? '#2b2b2b' : '#e8e1cf',
  red: w ? '#c0392b' : '#e0533d',
  gold: w ? '#c9a227' : '#d9b84a',
});

const wrap = (body: string) =>
  `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

export const japanSVGs = {
  // Shōgun: kabuto con cuernos en media luna (kuwagata)
  Shogun: (w: boolean) => {
    const c = pal(w);
    return wrap(`
    <g stroke="${c.stroke}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
      <path d="M22.5 13 C18 9 14 6 11 3 C12 8 15 12 20 15 M22.5 13 C27 9 31 6 34 3 C33 8 30 12 25 15" fill="${c.gold}"/>
      <circle cx="22.5" cy="14" r="2.2" fill="${c.red}"/>
      <path d="M12 23 C12 17 17 14 22.5 14 C28 14 33 17 33 23 Z" fill="${c.fill}"/>
      <path d="M9 23 L36 23 L33 28 L12 28 Z" fill="${c.fill}"/>
      <path d="M11 25.5 L34 25.5" stroke="${c.red}" stroke-width="1.4"/>
      <path d="M15 28 L30 28 L31 36 L14 36 Z" fill="${c.fill}"/>
      <path d="M15 31 L30 31 M14.5 33.5 L30.5 33.5" stroke-width="1"/>
      <path d="M11 36 L34 36 L35 41 L10 41 Z" fill="${c.fill}"/>
    </g>`);
  },

  // Onmyōji: sombrero eboshi alto y talismán
  Onmyoji: (w: boolean) => {
    const c = pal(w);
    return wrap(`
    <g stroke="${c.stroke}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
      <path d="M19 15 L18.5 6 C18.5 3 23 2 25 4 L26 15 Z" fill="${c.fill}"/>
      <circle cx="22.5" cy="18" r="4" fill="${c.fill}"/>
      <path d="M17 22 C13 25 11 31 11 38 L34 38 C34 31 32 25 28 22 Z" fill="${c.fill}"/>
      <path d="M22.5 22 L19 38 M22.5 22 L26 38" stroke-width="1"/>
      <path d="M30 11 L36 11 L36 22 L30 22 Z" fill="${c.fill}"/>
      <path d="M33 13 L33 20 M31.5 15 L34.5 15" stroke="${c.red}" stroke-width="1.4"/>
      <path d="M9 38 L36 38 L37 41 L8 41 Z" fill="${c.fill}"/>
      <path d="M12 33 L33 33" stroke="${c.red}" stroke-width="1.6"/>
    </g>`);
  },

  // Yagura: torre de vigía de dos tejados
  Yagura: (w: boolean) => {
    const c = pal(w);
    return wrap(`
    <g stroke="${c.stroke}" stroke-width="1.4" stroke-linejoin="round">
      <path d="M22.5 3 L22.5 6" />
      <path d="M8 13 C14 12 18 9 22.5 6 C27 9 31 12 37 13 L33 14 L12 14 Z" fill="${c.red}"/>
      <path d="M14 14 L31 14 L31 20 L14 20 Z" fill="${c.fill}"/>
      <path d="M19 16 L19 19 M26 16 L26 19" stroke-width="1.2"/>
      <path d="M6 25 C12 24 16 21 22.5 19 C29 21 33 24 39 25 L35 26 L10 26 Z" fill="${c.red}"/>
      <path d="M11 26 L34 26 L34 35 L11 35 Z" fill="${c.fill}"/>
      <path d="M20 35 L20 29 L25 29 L25 35" fill="${c.fill}"/>
      <path d="M8 35 L37 35 L38 41 L7 41 Z" fill="${c.fill}"/>
      <path d="M9 38 L36 38" stroke-width="1"/>
    </g>`);
  },

  // Monje Sōhei: capucha y naginata
  Sohei: (w: boolean) => {
    const c = pal(w);
    return wrap(`
    <g stroke="${c.stroke}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
      <path d="M10 39 L33 4" stroke-width="1.6"/>
      <path d="M31 4 C33 2 36 2 37 3 C36 6 34 8 32 8 Z" fill="${c.gold}"/>
      <path d="M15 20 C14 12 18 8 22.5 8 C27 8 31 12 30 20 L27 23 L18 23 Z" fill="${c.fill}"/>
      <path d="M19 15 L26 15 L26 19 C26 20 25 21 22.5 21 C20 21 19 20 19 19 Z" fill="${c.fill}"/>
      <path d="M16 23 C13 27 12 33 13 38 L32 38 C33 33 32 27 29 23 Z" fill="${c.fill}"/>
      <path d="M16 27 L29 27" stroke="${c.red}" stroke-width="1.8"/>
      <path d="M11 38 L34 38 L35 41 L10 41 Z" fill="${c.fill}"/>
    </g>`);
  },

  // Ninja: máscara con rendija de ojos y shuriken
  Ninja: (w: boolean) => {
    const c = pal(w);
    return wrap(`
    <g stroke="${c.stroke}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
      <path d="M13 22 C12 12 17 6 23 6 C29 6 33 11 32 20 L30 24 L15 24 Z" fill="${c.fill}"/>
      <path d="M14.5 14 L31.5 14 L31 18 L15 18 Z" fill="${c.stroke}"/>
      <path d="M18 16 L21 16 M24.5 16 L27.5 16" stroke="${c.fill}" stroke-width="1.6"/>
      <path d="M31 9 C35 10 37 13 38 16 C36 14 34 13 31.5 12.5" fill="${c.red}"/>
      <path d="M15 24 C12 28 12 33 13 38 L32 38 C33 33 33 28 30 24 Z" fill="${c.fill}"/>
      <path d="M15 30 L30 30" stroke="${c.red}" stroke-width="1.6"/>
      <path d="M38 26 L39.5 30 L43 31 L39.5 32 L38 36 L36.5 32 L33 31 L36.5 30 Z" fill="${c.gold}" stroke-width="1"/>
      <path d="M11 38 L34 38 L35 41 L10 41 Z" fill="${c.fill}"/>
    </g>`);
  },

  // Ashigaru: sombrero jingasa
  Ashigaru: (w: boolean) => {
    const c = pal(w);
    return wrap(`
    <g stroke="${c.stroke}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
      <path d="M9 16 L22.5 7 L36 16 C30 17 15 17 9 16 Z" fill="${c.fill}"/>
      <circle cx="22.5" cy="12.5" r="1.8" fill="${c.red}"/>
      <circle cx="22.5" cy="20" r="3.8" fill="${c.fill}"/>
      <path d="M17 24 L28 24 L30 33 L15 33 Z" fill="${c.fill}"/>
      <path d="M16.5 28.5 L28.5 28.5" stroke="${c.red}" stroke-width="1.6"/>
      <path d="M13 33 L32 33 L33 37 L12 37 Z" fill="${c.fill}"/>
      <path d="M11 37 L34 37 L35 41 L10 41 Z" fill="${c.fill}"/>
    </g>`);
  },
};
