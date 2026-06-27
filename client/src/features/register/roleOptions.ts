import type { Role, Sex } from '../../auth/types';

// Copys de los objetivos (paso 3). Texto en español, definido en la tarea.
export const ROLE_OPTIONS: { value: Role; title: string; description: string }[] = [
  {
    value: 'powerlifting',
    title: 'Powerlifting',
    description:
      'Fuerza máxima en sentadilla, press y peso muerto. La IA prioriza la recuperación para sesiones pesadas y autorregula la intensidad según tu readiness.',
  },
  {
    value: 'hypertrophy',
    title: 'Hipertrofia',
    description:
      'Ganar masa muscular. La IA vigila volumen, fatiga acumulada y sueño para sostener el crecimiento sin sobreentrenar.',
  },
  {
    value: 'general_health',
    title: 'Salud general',
    description:
      'Bienestar, energía y constancia. La IA equilibra actividad y descanso por encima del rendimiento máximo.',
  },
];

// Opciones de sexo (paso 2). Mapean a los valores del contrato.
export const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'male', label: 'Hombre' },
  { value: 'female', label: 'Mujer' },
  { value: 'other', label: 'Otro' },
];
