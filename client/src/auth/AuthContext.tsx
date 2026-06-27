import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  apiRequest,
  setAccessToken,
  setOnSessionExpired,
  tryRefresh,
} from '../lib/api';
import type { AuthResponse, RegisterPayload, User } from './types';
import { AuthContext, type AuthContextValue } from './useAuth';

// Proveedor de sesión de SmartPeak.
//
// - El accessToken vive EN MEMORIA (en lib/api.ts), no en localStorage.
// - Al montar, se rehidrata la sesión: refresh (cookie) → me. Mientras tanto,
//   `loading` es true para que las rutas protegidas no parpadeen.
//
// El contexto y el hook `useAuth` viven en ./authContext para mantener este
// archivo exportando solo componentes.

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Evita rehidratar dos veces bajo React.StrictMode en desarrollo.
  const didInit = useRef(false);

  // Limpia la sesión local cuando el refresh falla de forma definitiva.
  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  // Registra el handler de expiración en la capa de API.
  useEffect(() => {
    setOnSessionExpired(clearSession);
    return () => setOnSessionExpired(null);
  }, [clearSession]);

  // Rehidratación al montar: refresh → me.
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    let cancelled = false;
    (async () => {
      const refreshed = await tryRefresh();
      if (cancelled) return;
      if (refreshed) {
        try {
          const { user: me } = await apiRequest<{ user: User }>('/auth/me');
          if (!cancelled) setUser(me);
        } catch {
          if (!cancelled) clearSession();
        }
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const data = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: payload,
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest<{ ok: true }>('/auth/logout', { method: 'POST' });
    } catch {
      // Aunque el backend falle, limpiamos la sesión local igualmente.
    }
    clearSession();
  }, [clearSession]);

  const updateProfile = useCallback(
    async (patch: Partial<RegisterPayload>) => {
      const { user: updated } = await apiRequest<{ user: User }>('/users/me', {
        method: 'PATCH',
        body: patch,
      });
      setUser(updated);
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      loading,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, loading, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
