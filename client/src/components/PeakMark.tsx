import type { SVGProps } from 'react';

// Marca de SmartPeak: el "pico" (chevron ascendente). Igual que la landing y los
// assets de /brand. Usa currentColor para que tome el color del texto en ambos
// temas (chrome monocromo). Decorativo por defecto (aria-hidden); el nombre
// accesible lo da el wordmark/heading que lo acompaña.
export function PeakMark({
  size = 18,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M14 74 L50 26 L86 74"
        fill="none"
        stroke="currentColor"
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
