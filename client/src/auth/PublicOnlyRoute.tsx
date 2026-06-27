import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';
import { LoadingScreen } from './LoadingScreen';

// Ruta solo para invitados (login / registro).
// - Mientras se rehidrata la sesión, espera (evita mostrar login y saltar a /).
// - Si ya hay sesión → redirige a la home.
export function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}
