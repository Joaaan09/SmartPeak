import { useSyncExternalStore } from 'react';

import {
  getStatus,
  promptInstall,
  subscribe,
  type InstallStatus,
} from './installStore';

// Hook de instalación de la PWA. Lee el estado del store de módulo
// (`installStore`), que registra los listeners en el arranque de la app para no
// perder el `beforeinstallprompt` (Chrome lo dispara una sola vez al cargar). El
// affordance varía por plataforma: Android/Chrome/Edge exponen el prompt nativo;
// iOS Safari NO lo tiene, así que ahí solo cabe la guía manual (Compartir → Añadir).

/** Estado del affordance de instalación según plataforma/contexto. */
export type { InstallStatus };

export function useInstallPrompt(): {
  status: InstallStatus;
  promptInstall: () => Promise<void>;
} {
  // getStatus se reusa como getServerSnapshot: no hay SSR, así que es seguro.
  const status = useSyncExternalStore(subscribe, getStatus, getStatus);
  return { status, promptInstall };
}
