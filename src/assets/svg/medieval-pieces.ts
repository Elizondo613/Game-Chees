// src/assets/svg/medieval-pieces.ts

export const medievalSVGs = {
  King: (w: boolean) => `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="${w?'#fff':'#2a1a0a'}" stroke="${w?'#5c3a1e':'#f0c060'}" stroke-width="1.5">
      <path d="M22.5 4 L26 10 L22.5 8 L19 10 Z" fill="${w?'#FFD700':'#FFD700'}"/>
      <path d="M17 10 L19 10 L22.5 8 L26 10 L28 10 L28 14 L17 14 Z"/>
      <path d="M14 28 C14 20 17 16 22.5 16 C28 16 31 20 31 28"/>
      <path d="M12 28 L33 28 L31 38 L14 38 Z"/>
      <path d="M14 33 L31 33" stroke-width="1"/>
      <path d="M16 38 L29 38 L29 40 L16 40 Z"/>
    </g>
  </svg>`,

  Mage: (w: boolean) => `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="${w?'#fff':'#2a1a0a'}" stroke="${w?'#5c3a1e':'#f0c060'}" stroke-width="1.5">
      <path d="M22.5 3 L24 8 L29 8 L25 11 L27 16 L22.5 13 L18 16 L20 11 L16 8 L21 8 Z" fill="${w?'#FFD700':'#cc8800'}"/>
      <circle cx="22.5" cy="20" r="5"/>
      <path d="M17 25 C15 28 13 32 14 38 L31 38 C32 32 30 28 28 25 Z"/>
      <path d="M14 38 L31 38 L31 40 L14 40 Z"/>
      <path d="M18 30 C18 28 27 28 27 30" fill="none" stroke="${w?'#5c3a1e':'#f0c060'}" stroke-width="1"/>
    </g>
  </svg>`,

  Catapult: (w: boolean) => `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="${w?'#fff':'#2a1a0a'}" stroke="${w?'#5c3a1e':'#f0c060'}" stroke-width="1.5">
      <circle cx="14" cy="36" r="4"/>
      <circle cx="31" cy="36" r="4"/>
      <path d="M10 36 L35 36 L35 30 L10 30 Z"/>
      <path d="M22.5 30 L22.5 14 C22.5 14 28 10 30 6" stroke-width="2" fill="none"/>
      <circle cx="30" cy="6" r="3" fill="${w?'#888':'#555'}"/>
      <path d="M10 30 L10 26 L14 26 L14 30"/>
      <path d="M31 30 L31 26 L35 26 L35 30"/>
    </g>
  </svg>`,

  Cleric: (w: boolean) => `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="${w?'#fff':'#2a1a0a'}" stroke="${w?'#5c3a1e':'#f0c060'}" stroke-width="1.5">
      <path d="M20 6 L25 6 L25 11 L30 11 L30 14 L25 14 L25 19 L20 19 L20 14 L15 14 L15 11 L20 11 Z" fill="${w?'#FFD700':'#cc8800'}"/>
      <circle cx="22.5" cy="23" r="5"/>
      <path d="M17 28 L14 38 L31 38 L28 28 Z"/>
      <path d="M14 38 L31 38 L31 40 L14 40 Z"/>
    </g>
  </svg>`,

  Knight: (w: boolean) => `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="${w?'#fff':'#2a1a0a'}" stroke="${w?'#5c3a1e':'#f0c060'}" stroke-width="1.5">
      <path d="M10 38 L10 32 C10 24 14 18 20 14 C18 12 17 10 18 8 C20 6 24 7 26 10 C30 10 34 14 34 20 C34 27 30 33 28 38 Z"/>
      <path d="M10 38 L35 38 L35 40 L10 40 Z"/>
      <circle cx="20" cy="16" r="2" fill="${w?'#5c3a1e':'#f0c060'}" stroke="none"/>
      <path d="M22 10 C24 8 27 8 28 10" fill="none" stroke-width="1.5"/>
      <path d="M14 24 C16 20 20 19 24 20" fill="none" stroke-width="1"/>
    </g>
  </svg>`,

  Archer: (w: boolean) => `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="${w?'#fff':'#2a1a0a'}" stroke="${w?'#5c3a1e':'#f0c060'}" stroke-width="1.5">
      <circle cx="22.5" cy="10" r="5"/>
      <path d="M18 15 C16 18 15 22 16 26 L29 26 C30 22 29 18 27 15 Z"/>
      <path d="M16 26 L14 38 L31 38 L29 26 Z"/>
      <path d="M14 38 L31 38 L31 40 L14 40 Z"/>
      <path d="M10 20 L16 22" stroke-width="2" stroke-linecap="round"/>
      <path d="M10 20 L13 17 L13 23 Z" fill="${w?'#5c3a1e':'#f0c060'}"/>
    </g>
  </svg>`,
};