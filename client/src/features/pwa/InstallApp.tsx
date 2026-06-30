import { Button } from '../../components/ui/Button';
import { DownloadIcon, ShareIcon } from '../../components/icons';
import { useInstallPrompt } from './useInstallPrompt';

// Sección "Instalación" del Perfil. Es el affordance de PWA "Añadir a pantalla
// de inicio". Monocromo (sin datos → sin color, DESIGN.md §3). El comportamiento
// se bifurca por plataforma (ver useInstallPrompt): Android usa el prompt nativo;
// iOS Safari no lo tiene, así que mostramos una guía manual en un <details>
// semántico (disclosure accesible por teclado sin JS).
export function InstallApp() {
  const { status, promptInstall } = useInstallPrompt();

  // Ya instalada o navegador sin soporte: no hay nada que ofrecer.
  if (status === 'standalone' || status === 'unsupported') return null;

  return (
    <section className="mt-[28px] border-t border-line pt-[20px]">
      <h3 className="disp text-[12px] font-semibold uppercase tracking-[0.08em] text-text-muted">
        Instalación
      </h3>

      {status === 'installable' && (
        <>
          <p className="mt-[12px] font-body text-[14px] text-text-muted">
            Añade SmartPeak a tu pantalla de inicio para abrirla como una app.
          </p>
          <div className="mt-[12px]">
            <Button variant="ghost" onClick={promptInstall}>
              <DownloadIcon width={16} height={16} />
              Instalar app
            </Button>
          </div>
        </>
      )}

      {status === 'ios' && (
        <>
          <p className="mt-[12px] font-body text-[14px] text-text-muted">
            Añade SmartPeak a tu pantalla de inicio para abrirla como una app.
          </p>
          <details className="install-details mt-[12px]">
            <summary className="install-summary inline-flex min-h-[44px] cursor-pointer select-none items-center gap-2 font-body text-[14px] font-medium text-text">
              Cómo añadirla en iPhone
            </summary>
            <ol className="install-steps mt-[8px] list-decimal space-y-[8px] pl-[20px] font-body text-[14px] text-text-muted">
              <li>
                Pulsa{' '}
                <span className="font-medium text-text">
                  Compartir{' '}
                  <ShareIcon
                    width={15}
                    height={15}
                    className="inline-block -translate-y-px align-middle"
                  />
                </span>{' '}
                en la barra de Safari.
              </li>
              <li>
                Elige{' '}
                <span className="font-medium text-text">
                  Añadir a pantalla de inicio
                </span>
                .
              </li>
              <li>
                Confirma con <span className="font-medium text-text">Añadir</span>.
              </li>
            </ol>
          </details>
        </>
      )}
    </section>
  );
}
