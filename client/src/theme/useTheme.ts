import { createContext, useContext } from 'react';

// Contexto y hook de tema, separados del componente <ThemeProvider> para que
// el archivo del provider exporte SOLO componentes (Fast Refresh limpio).

// Solo dos temas (DESIGN.md §3): oscuro por defecto y claro "Paper".
// El usuario únicamente alterna entre ambos; no hay selector de acento.
export type Theme = 'dark' | 'paper';

export type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Hook de acceso al tema. Debe usarse dentro de <ThemeProvider>. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  }
  return ctx;
}
