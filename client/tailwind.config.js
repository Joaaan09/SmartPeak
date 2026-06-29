/** @type {import('tailwindcss').Config} */
// Mapeo de tokens CSS (src/styles/tokens.css) → utilidades de Tailwind.
// REGLA DURA (DESIGN.md §3): cero colores literales en componentes; el chrome es
// monocromo y el color vive solo en los datos. Todos los nombres de aquí
// referencian variables CSS, nunca valores hex.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Superficies neutras
        bg: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
        },
        // Hairlines y divisores
        line: {
          DEFAULT: 'var(--line)',
          strong: 'var(--line-strong)',
        },
        // Texto
        text: {
          DEFAULT: 'var(--text)',
          muted: 'var(--text-muted)',
          faint: 'var(--text-faint)',
        },
        // Énfasis de UI MONOCROMO (botón primario, foco). NO es color de marca.
        accent: {
          DEFAULT: 'var(--accent)',
          text: 'var(--accent-text)',
        },
        // Señales semánticas fijas
        pos: 'var(--pos)',
        neg: 'var(--neg)',
        warn: 'var(--warn)',
        // Pista del anillo sin rellenar
        'ring-track': 'var(--ring-track)',
        // Color POR MÉTRICA (provisionales, §3b). Solo en su métrica.
        m: {
          rdy: 'var(--m-rdy)',
          hrv: 'var(--m-hrv)',
          rhr: 'var(--m-rhr)',
          sleep: 'var(--m-sleep)',
          steps: 'var(--m-steps)',
          weight: 'var(--m-weight)',
        },
      },
      fontFamily: {
        // UI = Space Grotesk (igual que la landing); datos/labels = Space Mono.
        display: 'var(--display)',
        body: 'var(--body)',
        mono: 'var(--num)',
      },
      borderRadius: {
        r: 'var(--r)',
        'r-sm': 'var(--r-sm)',
      },
      boxShadow: {
        // Sombra suave iOS en tema claro; none en oscuro (lo decide el token).
        token: 'var(--shadow)',
        // Luz superior de 1px (bisel premium, §4).
        hi: 'inset 0 1px 0 var(--hi)',
      },
      transitionTimingFunction: {
        // Curvas de motion (§8). Nunca ease-in en UI, nunca bounce.
        out: 'var(--ease-out)',
        'out-ui': 'var(--ease-out-ui)',
        'in-out': 'var(--ease-in-out)',
      },
    },
  },
  plugins: [],
};
