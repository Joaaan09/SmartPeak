import { Controller, type UseFormReturn } from 'react-hook-form';
import { OptionCardGroup } from '../../../components/ui/OptionCardGroup';
import { errorId } from '../../../components/ui/fieldIds';
import type { Role } from '../../../auth/types';
import { ROLE_OPTIONS } from '../roleOptions';
import type { RegisterFormValues } from '../schema';

// Paso 3 · Objetivo: 3 tarjetas seleccionables (radiogroup) — realce monocromo.
export function StepGoal({
  form,
}: {
  form: UseFormReturn<RegisterFormValues>;
}) {
  const { control, formState } = form;
  const error = formState.errors.role?.message;

  return (
    <div className="flex flex-col gap-2">
      <Controller
        control={control}
        name="role"
        render={({ field }) => (
          <OptionCardGroup<Role>
            name="role"
            legend="¿Cuál es tu objetivo?"
            options={ROLE_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={error}
            errorId={errorId('role')}
          />
        )}
      />
      {error ? (
        <p id={errorId('role')} role="alert" className="font-body text-xs text-neg">
          {error}
        </p>
      ) : null}
      <p className="font-body text-xs text-text-muted">
        Podrás cambiarlo cuando quieras desde tu perfil.
      </p>
    </div>
  );
}
