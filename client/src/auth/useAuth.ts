import { createContext, useContext } from 'react';
import type { RegisterPayload, User } from './types';

// Contexto y hook de sesión, separados del componente <AuthProvider> para que
// el archivo del provider exporte SOLO componentes (Fast Refresh limpio).

export type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<RegisterPayload>) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

/** Hook de acceso a la sesión. Debe usarse dentro de <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
