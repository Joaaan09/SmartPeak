import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { ThemeContext, type Theme } from './useTheme';

// Solo dos temas (DESIGN.md §3): oscuro por defecto y claro "Paper".
// El usuario únicamente alterna entre ambos; no hay selector de acento.
//
// El contexto y el hook `useTheme` viven en ./useTheme para mantener este
// archivo exportando solo componentes (Fast Refresh limpio).

const STORAGE_KEY = 'smartpeak.theme';

/** Lee el tema persistido; el default es oscuro (DESIGN.md §3). */
function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'paper' ? 'paper' : 'dark';
}

/** Aplica el tema al <body>: la clase `paper` activa el tema claro. */
function applyTheme(theme: Theme): void {
  document.body.classList.toggle('paper', theme === 'paper');
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  // Sincroniza la clase del <body> y la persistencia con el estado.
  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);
  const toggleTheme = useCallback(
    () => setThemeState((prev) => (prev === 'dark' ? 'paper' : 'dark')),
    [],
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
