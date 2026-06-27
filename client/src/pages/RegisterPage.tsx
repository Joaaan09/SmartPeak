import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../auth/useAuth';
import { ApiError } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Wordmark } from '../components/Wordmark';
import { StepProgress } from '../features/register/StepProgress';
import {
  registerSchema,
  STEP_FIELDS,
  stepOfField,
  toRegisterPayload,
  type RegisterField,
  type RegisterFormValues,
} from '../features/register/schema';
import { StepAccount } from '../features/register/steps/StepAccount';
import { StepProfile } from '../features/register/steps/StepProfile';
import { StepGoal } from '../features/register/steps/StepGoal';
import { StepPhysical } from '../features/register/steps/StepPhysical';
import { StepReview } from '../features/register/steps/StepReview';

const TOTAL_STEPS = 5;

// Títulos por paso (encabezado del wizard).
const STEP_TITLES = [
  'Crea tu cuenta',
  'Tu perfil',
  'Tu objetivo',
  'Datos físicos',
  'Todo listo',
];

const STEP_SUBTITLES = [
  'Empecemos por tus credenciales.',
  'Cuéntanos quién eres.',
  'La IA adapta sus consejos a esto.',
  'Para calibrar tus métricas.',
  'Confirma y entra a SmartPeak.',
];

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0); // 0-based
  // Dirección de la transición (1 adelante, -1 atrás) para el translate.
  const [direction, setDirection] = useState(1);
  // key para reiniciar la animación de entrada del paso al cambiar.
  const [animKey, setAnimKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur', // valida en blur (DESIGN.md §11)
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      sex: undefined,
      birthDate: '',
      role: undefined,
      height: undefined as unknown as number,
      weight: undefined as unknown as number,
      targetWeight: undefined as unknown as number,
    },
  });

  const isLastStep = step === TOTAL_STEPS - 1;

  function goTo(next: number, dir: number) {
    setDirection(dir);
    setStep(next);
    setAnimKey((k) => k + 1);
  }

  async function handleNext() {
    setFormError(null);
    // Valida solo los campos del paso actual antes de avanzar.
    const fields = STEP_FIELDS[step] as RegisterField[];
    const valid = await form.trigger(fields, { shouldFocus: true });
    if (!valid) return;
    if (step < TOTAL_STEPS - 1) goTo(step + 1, 1);
  }

  function handleBack() {
    setFormError(null);
    if (step > 0) goTo(step - 1, -1);
  }

  // Mapea errores de campo del backend (400) al formulario y lleva al paso
  // que contiene el primer campo con error.
  function applyServerErrors(errors: Record<string, string>) {
    const fields = Object.keys(errors);
    fields.forEach((field) => {
      form.setError(field as RegisterField, {
        type: 'server',
        message: errors[field],
      });
    });
    if (fields.length > 0) {
      const target = Math.min(...fields.map(stepOfField));
      goTo(target, -1);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLastStep) {
      // En pasos intermedios, Enter avanza en vez de enviar.
      await handleNext();
      return;
    }

    // Última validación completa antes de enviar.
    const valid = await form.trigger();
    if (!valid) return;

    setFormError(null);
    setSubmitting(true);
    try {
      const payload = toRegisterPayload(form.getValues());
      await registerUser(payload);
      navigate('/', { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        // Email ya registrado → error en el campo email y vuelta al paso 1.
        form.setError('email', {
          type: 'server',
          message: error.message || 'Ese correo ya está registrado.',
        });
        goTo(0, -1);
      } else if (error instanceof ApiError && error.errors) {
        applyServerErrors(error.errors);
      } else if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError(
          'No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [
    <StepAccount key="s1" form={form} />,
    <StepProfile key="s2" form={form} />,
    <StepGoal key="s3" form={form} />,
    <StepPhysical key="s4" form={form} />,
    <StepReview key="s5" form={form} />,
  ];

  return (
    <main className="flex min-h-[100dvh] flex-col">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 pt-10"
      >
        {/* Cabecera: wordmark + progreso */}
        <header className="mb-7 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <Wordmark />
            <Link
              to="/login"
              className="font-body text-sm text-text-muted underline-offset-2 hover:text-text hover:underline focus-visible:outline-none focus-visible:text-text"
            >
              Entrar
            </Link>
          </div>
          <StepProgress current={step + 1} total={TOTAL_STEPS} />
        </header>

        {/* Título del paso */}
        <div className="mb-6">
          <h1 className="disp text-2xl font-semibold tracking-[-0.01em] text-text">
            {STEP_TITLES[step]}
          </h1>
          <p className="mt-1 font-body text-sm text-text-muted">
            {STEP_SUBTITLES[step]}
          </p>
        </div>

        {/* Error global de envío */}
        {formError ? (
          <p
            role="alert"
            aria-live="assertive"
            className="mb-4 rounded-r-sm border border-neg bg-surface px-3.5 py-2.5 font-body text-sm text-neg"
          >
            {formError}
          </p>
        ) : null}

        {/* Contenido del paso, con transición crossfade + translate (§8) */}
        <div className="flex-1 pb-28">
          <div
            key={animKey}
            className="step-enter"
            style={{ ['--step-dir' as string]: String(direction) }}
          >
            {steps[step]}
          </div>
        </div>

        {/* Footer pegado abajo, respeta safe-area en móvil */}
        <div className="fixed inset-x-0 bottom-0 border-t border-line backdrop-blur-md [background:color-mix(in_srgb,var(--bg)_88%,transparent)]">
          <div className="mx-auto flex w-full max-w-sm items-center gap-3 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            {step > 0 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={submitting}
              >
                Atrás
              </Button>
            ) : null}

            {isLastStep ? (
              <Button type="submit" loading={submitting} fullWidth>
                {submitting ? 'Creando…' : 'Crear cuenta'}
              </Button>
            ) : (
              <Button type="button" onClick={handleNext} fullWidth>
                Siguiente
              </Button>
            )}
          </div>
        </div>
      </form>
    </main>
  );
}
