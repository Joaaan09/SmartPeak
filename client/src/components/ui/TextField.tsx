import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { Field } from './Field';
import { errorId, hintId } from './fieldIds';

// Campo de texto del sistema (DESIGN.md §11): label visible encima, input con
// tokens (bg-surface, border-line, radio --r-sm, foco visible), error debajo en
// --neg ligado por aria-describedby, aria-invalid cuando hay error.
//
// Tipografía (DESIGN.md §2): el valor que teclea el usuario en inputs numéricos
// o de fecha ES UN DATO → fuente mono tabular. El resto (email/password) usa la
// fuente del sistema. La unidad (cm/kg) va pequeña en --text-muted dentro del
// input, sin tapar el valor.

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string;
  error?: string;
  hint?: string;
  /** Unidad opcional (p. ej. "cm", "kg") mostrada a la derecha del valor. */
  unit?: string;
  /** id explícito; si no se pasa, se genera uno estable. */
  id?: string;
};

const inputBase =
  'min-h-[44px] w-full rounded-r-sm border bg-surface px-3.5 text-base text-text ' +
  'placeholder:text-text-faint transition-colors duration-150 ease-out-ui ' +
  'focus-visible:outline-none focus-visible:border-text ' +
  'disabled:opacity-50';

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { label, error, hint, unit, type = 'text', className = '', id, ...rest },
    ref,
  ) {
    const reactId = useId();
    const controlId = id ?? reactId;
    const hasError = Boolean(error);

    // El valor es un dato cuando es numérico o fecha → fuente mono tabular.
    const isData = type === 'number' || type === 'date';
    const fontClass = isData ? 'mono' : 'font-body';

    const describedBy = hasError
      ? errorId(controlId)
      : hint
        ? hintId(controlId)
        : undefined;

    const borderClass = hasError ? 'border-neg' : 'border-line';

    const input = (
      <input
        ref={ref}
        id={controlId}
        type={type}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        className={`${inputBase} ${borderClass} ${fontClass} ${unit ? 'pr-12' : ''} ${className}`}
        {...rest}
      />
    );

    return (
      <Field controlId={controlId} label={label} error={error} hint={hint}>
        {unit ? (
          <div className="relative">
            {input}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center font-body text-xs text-text-muted"
            >
              {unit}
            </span>
          </div>
        ) : (
          input
        )}
      </Field>
    );
  },
);
