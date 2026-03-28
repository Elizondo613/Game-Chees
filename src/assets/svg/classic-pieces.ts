// src/assets/svg/classic-pieces.ts

export const classicSVGs = {
  K: (w: boolean) => `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="${w?'#fff':'#1a1a1a'}" stroke="${w?'#1a1a1a':'#e8e8e8'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22.5 6 L22.5 13 M19 9.5 L26 9.5" stroke-width="2"/>
      <path d="M14 29 C14 24 12 22 12 19 C12 14 17 11 22.5 11 C28 11 33 14 33 19 C33 22 31 24 31 29"/>
      <path d="M12 29 L33 29 L33 32 Q22.5 36 12 32 Z"/>
      <path d="M12 36 L33 36" stroke-width="1"/>
      <path d="M14 32 L14 39 L31 39 L31 32" fill="${w?'#fff':'#1a1a1a'}"/>
      <path d="M12 39 L33 39 L33 41 L12 41 Z"/>
    </g>
  </svg>`,

  Q: (w: boolean) => `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="${w?'#fff':'#1a1a1a'}" stroke="${w?'#1a1a1a':'#e8e8e8'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="6.5" cy="12" r="3"/>
      <circle cx="14" cy="8" r="3"/>
      <circle cx="22.5" cy="6.5" r="3"/>
      <circle cx="31" cy="8" r="3"/>
      <circle cx="38.5" cy="12" r="3"/>
      <path d="M6.5 14 L9 26 L36 26 L38.5 14 Q31 20 22.5 15 Q14 20 6.5 14 Z"/>
      <path d="M9 26 L9 28 L36 28 L36 26"/>
      <path d="M9 28 Q22.5 33 36 28 L36 31 Q22.5 37 9 31 Z"/>
      <path d="M9 31 L9 33 L36 33 L36 31"/>
    </g>
  </svg>`,

  R: (w: boolean) => `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="${w?'#fff':'#1a1a1a'}" stroke="${w?'#1a1a1a':'#e8e8e8'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 9 L9 15 L13 15 L13 12 L19 12 L19 15 L26 15 L26 12 L32 12 L32 15 L36 15 L36 9 Z"/>
      <path d="M13 15 L13 30 L32 30 L32 15 Z"/>
      <path d="M9 30 L36 30 L36 33 L9 33 Z"/>
      <path d="M9 33 L36 33 L36 36 L9 36 Z"/>
    </g>
  </svg>`,

  B: (w: boolean) => `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="${w?'#fff':'#1a1a1a'}" stroke="${w?'#1a1a1a':'#e8e8e8'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="22.5" cy="7" r="3"/>
      <path d="M22.5 10 C18 10 12 14 12 22 C12 27 15 30 18 32 L14 34 L14 36 L31 36 L31 34 L27 32 C30 30 33 27 33 22 C33 14 27 10 22.5 10 Z"/>
      <path d="M14 36 L31 36 L31 38 L14 38 Z"/>
      <path d="M15 22 Q22.5 18 30 22" fill="none" stroke="${w?'#1a1a1a':'#e8e8e8'}" stroke-width="1"/>
    </g>
  </svg>`,

  N: (w: boolean) => `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="${w?'#fff':'#1a1a1a'}" stroke="${w?'#1a1a1a':'#e8e8e8'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13 36 C13 28 9 24 9 18 C9 12 14 8 20 8 C22 8 24 9 25 10 C27 8 30 7 32 9 C30 10 29 12 29 14 C31 16 33 20 33 25 C33 30 31 34 29 36 Z"/>
      <path d="M13 36 L32 36 L32 38 L13 38 Z"/>
      <circle cx="17" cy="15" r="2" fill="${w?'#1a1a1a':'#e8e8e8'}" stroke="none"/>
      <path d="M20 8 C20 8 16 11 15 14" fill="none"/>
    </g>
  </svg>`,

  P: (w: boolean) => `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="${w?'#fff':'#1a1a1a'}" stroke="${w?'#1a1a1a':'#e8e8e8'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="22.5" cy="10" r="6"/>
      <path d="M16 20 C16 16 19 14 22.5 14 C26 14 29 16 29 20 C29 23 27 25 25 26 L27 30 L18 30 L20 26 C18 25 16 23 16 20 Z"/>
      <path d="M15 30 L30 30 L30 33 L15 33 Z"/>
      <path d="M13 33 L32 33 L32 36 L13 36 Z"/>
    </g>
  </svg>`,
};