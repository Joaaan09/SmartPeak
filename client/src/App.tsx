import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { PublicOnlyRoute } from './auth/PublicOnlyRoute';
import { AppLayout } from './layout/AppLayout';
import { TodayPage } from './features/today/TodayPage';
import { TrendsPage } from './pages/TrendsPage';
import { TrainingPage } from './pages/TrainingPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Routing con sesión. Las rutas autenticadas viven DENTRO de AppLayout (shell:
// regleta desktop + tab bar móvil + header de pestaña), anidadas con <Outlet>.
// El toggle de tema vive ahora en el rail (desktop) y en la pestaña Perfil
// (móvil); ya no hay toggle flotante provisional.
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

            {/* Requiere sesión → dentro del shell */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<TodayPage />} />
                <Route path="/tendencias" element={<TrendsPage />} />
                <Route path="/entreno" element={<TrainingPage />} />
                <Route path="/perfil" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Cualquier otra ruta → home (la decide el guard según sesión). */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
