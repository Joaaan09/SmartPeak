// Store de instalación PWA. Se importa en el arranque (main.tsx) para capturar el
// evento `beforeinstallprompt` ANTES de que el usuario navegue: Chrome lo dispara una
// sola vez al cargar y, si nadie escucha en ese instante, se pierde para toda la sesión.
export type InstallStatus = 'standalone' | 'installable' | 'ios' | 'unsupported';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const iDevice = /iphone|ipad|ipod/i.test(ua);
  // iPadOS moderno se reporta como "Macintosh" pero es táctil:
  const iPadOS = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  return iDevice || iPadOS;
}

function computeStatus(): InstallStatus {
  if (isStandalone()) return 'standalone';
  if (deferredPrompt) return 'installable';
  if (isIOS()) return 'ios';
  return 'unsupported';
}

let status: InstallStatus = computeStatus();

function setStatus(next: InstallStatus): void {
  if (next === status) return;
  status = next;
  listeners.forEach((l) => l());
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    if (!isStandalone()) setStatus('installable');
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    setStatus('standalone');
  });
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getStatus(): InstallStatus {
  return status;
}

export async function promptInstall(): Promise<void> {
  if (!deferredPrompt) return;
  const prompt = deferredPrompt;
  await prompt.prompt();
  await prompt.userChoice;
  // El prompt es de un solo uso. Lo consumimos y reevaluamos el estado: si el usuario
  // aceptó, llegará `appinstalled` (→ standalone); si lo descartó, dejamos de ofrecer el
  // botón (queda installable→ recalculado a ios/unsupported) para no dejar un botón muerto.
  deferredPrompt = null;
  if (!isStandalone()) setStatus(computeStatus());
}
