import { Controller, type UseFormReturn } from 'react-hook-form';
import { TextField } from '../../../components/ui/TextField';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { errorId } from '../../../components/ui/fieldIds';
import type { Sex } from '../../../auth/types';
import { SEX_OPTIONS } from '../roleOptions';
import type { RegisterFormValues } from '../schema';

// Paso 2 · Perfil: name, sex (segmented), birthDate.
export function StepProfile({
  form,
}: {
  form: UseFormReturn<RegisterFormValues>;
}) {
  const { register, control, formState } = form;
  const { errors } = formState;

  // Tope superior del input date = ayer (debe ser fecha pasada).
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Nombre"
        type="text"
        autoComplete="given-name"
        placeholder="¿Cómo te llamas?"
        error={errors.name?.message}
        {...register('name')}
      />

      <Controller
        control={control}
        name="sex"
        render={({ field }) => (
          <SegmentedControl<Sex>
            name="sex"
            legend="Sexo"
            options={SEX_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.sex?.message}
            errorId={errorId('sex')}
          />
        )}
      />
      {errors.sex?.message ? (
        <p id={errorId('sex')} role="alert" className="-mt-3 font-body text-xs text-neg">
          {errors.sex.message}
        </p>
      ) : null}

      <TextField
        label="Fecha de nacimiento"
        type="date"
        autoComplete="bday"
        max={yesterday}
        error={errors.birthDate?.message}
        {...register('birthDate')}
      />
    </div>
  );
}
