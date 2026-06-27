import { type ReactNode } from 'react';
import { errorId, hintId } from './fieldIds';

// Envoltorio genérico de campo de formulario (DESIGN.md §11):
// label VISIBLE encima del control + mensaje de error debajo en --neg, ligado
// por aria-describedby desde el control. El placeholder NUNCA hace de label.
//
// `Field` no pinta el control: recibe `controlId` y los renderiza como children,
// para que el control concreto (input/grupo/segmented) controle sus props ARIA.

type FieldProps = {
  /** id del control al que apunta el <label>. */
  controlId: string;
  /** Texto del label visible. */
  label: string;
  /** Mensaje de error; si existe, se muestra debajo en --neg. */
  error?: string;
  /** Texto de ayuda fino bajo el control (cuando no hay error). */
  hint?: string;
  /** El control en sí (input, fieldset…). */
  children: ReactNode;
  /** Si el label debe ser un <legend> (grupos): usar `as="group"`. */
  as?: 'field' | 'group';
};

export function Field({
  controlId,
  label,
  error,
  hint,
  children,
  as = 'field',
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {as === 'field' ? (
        <label
          htmlFor={controlId}
          className="font-body text-sm font-medium text-text"
        >
          {label}
        </label>
      ) : null}

      {children}

      {error ? (
        <p
          id={errorId(controlId)}
          role="alert"
          className="font-body text-xs text-neg"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={hintId(controlId)} className="font-body text-xs text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
