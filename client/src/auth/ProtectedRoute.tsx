import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';
import { LoadingScreen } from './LoadingScreen';

// Ruta protegida: requiere sesión iniciada.
// - Mientras se rehidrata la sesión, muestra el estado de carga (no parpadea
//   hacia /login antes de saber si hay sesión válida).
// - Sin sesión → redirige a /login.
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
