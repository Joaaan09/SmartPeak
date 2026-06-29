import { PeakMark } from './PeakMark';

// Wordmark "SmartPeak" como en la landing: el pico + el nombre en Space Grotesk
// (peso 700, tracking ligeramente negativo). El pico va en --text (monocromo).
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[8px] text-text ${className}`}>
      <PeakMark size={20} />
      <span className="disp text-lg font-bold tracking-[-0.02em]">SmartPeak</span>
    </span>
  );
}
