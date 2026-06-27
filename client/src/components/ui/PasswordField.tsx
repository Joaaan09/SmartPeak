import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react';
import { Field } from './Field';
import { errorId, hintId } from './fieldIds';

// Campo de contraseña con toggle mostrar/ocultar (DESIGN.md §11).
// El botón del toggle es ≥44px, lleva aria-label y aria-pressed. Mismo patrón de
// error y a11y que TextField. La contraseña no es un "dato" mostrable → fuente
// del sistema (cuando se enmascara da igual; al revelar, sigue siendo texto UI).

type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id' | 'type'
> & {
  label: string;
  error?: string;
  hint?: string;
  id?: string;
};

const inputBase =
  'min-h-[44px] w-full rounded-r-sm border bg-surface pl-3.5 pr-12 font-body text-base text-text ' +
  'placeholder:text-text-faint transition-colors duration-150 ease-out-ui ' +
  'focus-visible:outline-none focus-visible:border-text disabled:opacity-50';

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ label, error, hint, className = '', id, ...rest }, ref) {
    const reactId = useId();
    const controlId = id ?? reactId;
    const [visible, setVisible] = useState(false);
    const hasError = Boolean(error);

    const describedBy = hasError
      ? errorId(controlId)
      : hint
        ? hintId(controlId)
        : undefined;

    const borderClass = hasError ? 'border-neg' : 'border-line';

    return (
      <Field controlId={controlId} label={label} error={error} hint={hint}>
        <div className="relative">
          <input
            ref={ref}
            id={controlId}
            type={visible ? 'text' : 'password'}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            className={`${inputBase} ${borderClass} ${className}`}
            {...rest}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-text-muted transition-colors duration-150 ease-out-ui focus-visible:outline-none focus-visible:text-text [@media(hover:hover)and(pointer:fine)]:hover:text-text"
          >
            {visible ? (
              // Ojo tachado (ocultar).
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="M3 3l18 18" />
                <path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c5 0 9 5 9 7a12 12 0 0 1-2.2 2.9M6.3 6.3C3.8 7.8 2 10.3 2 12c0 2 4 7 9 7a9.7 9.7 0 0 0 4.2-1" />
                <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
              </svg>
            ) : (
              // Ojo (mostrar).
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </Field>
    );
  },
);
