// Segmented control accesible (grupo de radios) — monocromo (DESIGN.md §3).
// Semántica: <fieldset>/<legend> + <input type="radio"> ocultos visualmente,
// con la píldora activa rellena en --surface-2 / borde --accent. Navegable por
// teclado de forma nativa (flechas entre radios).

type Option<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  /** id base, para enlazar legend/error. */
  name: string;
  legend: string;
  options: Option<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  onBlur?: () => void;
  error?: string;
  /** id del nodo de error, para aria-describedby del grupo. */
  errorId?: string;
};

export function SegmentedControl<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  onBlur,
  error,
  errorId,
}: SegmentedControlProps<T>) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 font-body text-sm font-medium text-text">
        {legend}
      </legend>
      <div
        role="radiogroup"
        aria-describedby={error ? errorId : undefined}
        className="grid grid-cols-3 gap-1 rounded-full border border-line bg-surface p-1"
      >
        {options.map((opt) => {
          const checked = value === opt.value;
          return (
            <label
              key={opt.value}
              className={[
                'flex min-h-[40px] cursor-pointer items-center justify-center rounded-full px-3',
                'font-body text-sm font-medium transition-colors duration-150 ease-out-ui',
                'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent',
                checked
                  ? 'bg-surface-2 text-text shadow-token'
                  : 'text-text-muted',
              ].join(' ')}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                onBlur={onBlur}
                className="sr-only"
              />
              {opt.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
