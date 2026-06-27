import { type UseFormReturn } from 'react-hook-form';
import { ROLE_LABELS } from '../../../auth/types';
import type { Role } from '../../../auth/types';
import type { RegisterFormValues } from '../schema';

// Fila del resumen: etiqueta (UI) + valor. `data` decide si el valor va en mono.
function Row({
  label,
  value,
  data = false,
}: {
  label: string;
  value: string;
  data?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <span className="font-body text-sm text-text-muted">{label}</span>
      <span
        className={`text-right text-sm text-text ${data ? 'mono' : 'font-body font-medium'}`}
      >
        {value}
      </span>
    </div>
  );
}

// Paso 5 · Listo: resumen compacto de lo elegido. Físicos en mono (son datos).
export function StepReview({
  form,
}: {
  form: UseFormReturn<RegisterFormValues>;
}) {
  const values = form.getValues();
  const roleLabel = values.role
    ? ROLE_LABELS[values.role as Role]
    : '—';

  return (
    <div className="flex flex-col gap-4">
      <p className="font-body text-sm text-text-muted">
        Revisa que todo esté correcto antes de crear tu cuenta.
      </p>

      <div className="divide-y divide-line rounded-r border border-line bg-surface px-4 shadow-token">
        <Row label="Nombre" value={values.name || '—'} />
        <Row label="Correo" value={values.email || '—'} />
        <Row label="Objetivo" value={roleLabel} />
        <Row
          label="Altura"
          value={values.height ? `${values.height} cm` : '—'}
          data
        />
        <Row
          label="Peso actual"
          value={values.weight ? `${values.weight} kg` : '—'}
          data
        />
        <Row
          label="Peso objetivo"
          value={values.targetWeight ? `${values.targetWeight} kg` : '—'}
          data
        />
      </div>
    </div>
  );
}
