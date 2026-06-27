import type { ReactNode } from 'react';
import { AppHeader } from '../../layout/AppHeader';

// Página placeholder de pestañas aún sin construir (Tendencias / Entreno).
// Renderiza el AppHeader correcto (para que la nav funcione y el shell sea
// coherente) y un mensaje "Próximamente". Acepta children para casos como Perfil
// que sí tienen contenido funcional.
export function PlaceholderPage({
  tab,
  children,
}: {
  tab: string;
  children?: ReactNode;
}) {
  return (
    <>
      <AppHeader tab={tab} />
      <div className="flex flex-1 flex-col px-[18px] py-[24px] sm:px-[30px]">
        {children ?? (
          <p className="disp text-[13px] font-medium text-text-faint">
            {tab} · Próximamente
          </p>
        )}
      </div>
    </>
  );
}
