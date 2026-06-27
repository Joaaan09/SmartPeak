import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import { ThemeToggle } from './theme/ThemeToggle';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { PublicOnlyRoute } from './auth/PublicOnlyRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Routing con sesión: rutas públicas (login/register) solo para invitados y
// rutas protegidas detrás de ProtectedRoute. El shell real (rail / tab bar) se
// añade en otra fase; aquí solo está la home mínima para verificar el flujo.
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Solo invitados */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Requiere sesión */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
            </Route>

            {/* Cualquier otra ruta → home (la decide el guard según sesión). */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {/* Toggle de tema provisional para verificar ambos temas. */}
          <ThemeToggle />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
