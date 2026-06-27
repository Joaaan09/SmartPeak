import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { ApiError } from '../lib/api';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { PasswordField } from '../components/ui/PasswordField';
import { Wordmark } from '../components/Wordmark';

// Pantalla de Login. Mobile-first, una columna, centrada.
// - Validación de credenciales en el servidor (401 → mensaje accesible).
// - Enter envía el formulario; todo navegable por teclado.
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Error global (credenciales inválidas / red). Accesible vía role="alert".
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setFormError('Correo o contraseña incorrectos.');
      } else if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError('No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <header className="mb-8 flex flex-col items-center gap-2 text-center">
          <Wordmark />
          <h1 className="disp text-2xl font-semibold tracking-[-0.01em] text-text">
            Inicia sesión
          </h1>
          <p className="font-body text-sm text-text-muted">
            Tu entrenador bajo demanda te espera.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {/* Error global de credenciales (no un alert() del navegador). */}
          {formError ? (
            <p
              role="alert"
              aria-live="assertive"
              className="rounded-r-sm border border-neg bg-surface px-3.5 py-2.5 font-body text-sm text-neg"
            >
              {formError}
            </p>
          ) : null}

          <TextField
            label="Correo electrónico"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <PasswordField
            label="Contraseña"
            name="password"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" loading={submitting} fullWidth className="mt-2">
            {submitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        <p className="mt-6 text-center font-body text-sm text-text-muted">
          ¿No tienes cuenta?{' '}
          <Link
            to="/register"
            className="font-medium text-text underline-offset-2 hover:underline focus-visible:outline-none focus-visible:underline"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </main>
  );
}
