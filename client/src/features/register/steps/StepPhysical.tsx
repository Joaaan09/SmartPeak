import { type UseFormReturn } from 'react-hook-form';
import { TextField } from '../../../components/ui/TextField';
import type { RegisterFormValues } from '../schema';

// Paso 4 · Datos físicos: height (cm), weight (kg), targetWeight (kg).
// Inputs numéricos con valor en mono y unidad en --text-muted (TextField ya lo
// resuelve para type="number" + prop unit). Rangos plausibles validados en zod.
export function StepPhysical({
  form,
}: {
  form: UseFormReturn<RegisterFormValues>;
}) {
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Altura"
        type="number"
        inputMode="numeric"
        unit="cm"
        placeholder="175"
        min={100}
        max={250}
        step={1}
        error={errors.height?.message}
        {...register('height', { valueAsNumber: true })}
      />
      <TextField
        label="Peso actual"
        type="number"
        inputMode="decimal"
        unit="kg"
        placeholder="80"
        min={30}
        max={300}
        step={0.1}
        error={errors.weight?.message}
        {...register('weight', { valueAsNumber: true })}
      />
      <TextField
        label="Peso objetivo"
        type="number"
        inputMode="decimal"
        unit="kg"
        placeholder="78"
        min={30}
        max={300}
        step={0.1}
        hint="Tu meta de peso; podrás ajustarla más adelante."
        error={errors.targetWeight?.message}
        {...register('targetWeight', { valueAsNumber: true })}
      />
    </div>
  );
}
