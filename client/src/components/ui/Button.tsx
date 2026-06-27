import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

// Botón reutilizable del sistema (DESIGN.md §11: los 8 estados).
//
// Variantes (basadas en el mockup canónico):
// - `primary`  = .btn  → fondo --accent, texto --accent-text, píldora.
// - `ghost`    = .ctl  → superficie, borde --line, píldora (también `secondary`).
//
// Estados cubiertos: default · hover (solo puntero fino) · focus-visible ·
// active (scale .97, ~140ms --ease-out-ui) · disabled · loading.
// Touch target ≥44px gracias a min-h-[44px].

type Variant = 'primary' | 'ghost' | 'secondary';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
};

const base =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full ' +
  'px-5 font-body text-sm font-semibold leading-none ' +
  'transition-[transform,color,background-color,border-color,filter] duration-150 ease-out-ui ' +
  'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ' +
  'focus-visible:outline-none';

const variants: Record<Variant, string> = {
  // .btn — primario monocromo.
  primary: 'bg-accent text-accent-text [@media(hover:hover)and(pointer:fine)]:hover:brightness-95',
  // .ctl — secundario con borde sutil.
  ghost:
    'border border-line bg-surface text-text [@media(hover:hover)and(pointer:fine)]:hover:border-line-strong',
  secondary:
    'border border-line bg-surface text-text [@media(hover:hover)and(pointer:fine)]:hover:border-line-strong',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    loading = false,
    fullWidth = false,
    disabled,
    type = 'button',
    className = '',
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
        base,
        variants[variant],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
});
