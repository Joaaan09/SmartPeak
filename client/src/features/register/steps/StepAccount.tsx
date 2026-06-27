import { type UseFormReturn } from 'react-hook-form';
import { TextField } from '../../../components/ui/TextField';
import { PasswordField } from '../../../components/ui/PasswordField';
import type { RegisterFormValues } from '../schema';

// Paso 1 · Cuenta: email, password (mín 8), confirmar password.
export function StepAccount({
  form,
}: {
  form: UseFormReturn<RegisterFormValues>;
}) {
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="tu@correo.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <PasswordField
        label="Contraseña"
        autoComplete="new-password"
        placeholder="Mínimo 8 caracteres"
        hint="Usa al menos 8 caracteres."
        error={errors.password?.message}
        {...register('password')}
      />
      <PasswordField
        label="Repetir contraseña"
        autoComplete="new-password"
        placeholder="Repite la contraseña"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
    </div>
  );
}
