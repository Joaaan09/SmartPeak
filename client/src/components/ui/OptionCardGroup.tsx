// Grupo de tarjetas seleccionables (radiogroup accesible) — monocromo.
// Selección resaltada con borde --accent (DESIGN.md §3: nada de color de marca).
// Semántica: <fieldset>/<legend> + radios reales ocultos; la tarjeta es el label.

type CardOption<T extends string> = {
  value: T;
  title: string;
  description: string;
};

type OptionCardGroupProps<T extends string> = {
  name: string;
  legend: string;
  options: CardOption<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  onBlur?: () => void;
  error?: string;
  errorId?: string;
};

export function OptionCardGroup<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  onBlur,
  error,
  errorId,
}: OptionCardGroupProps<T>) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-2 font-body text-sm font-medium text-text">
        {legend}
      </legend>
      <div
        role="radiogroup"
        aria-describedby={error ? errorId : undefined}
        className="flex flex-col gap-2.5"
      >
        {options.map((opt) => {
          const checked = value === opt.value;
          return (
            <label
              key={opt.value}
              className={[
                'relative flex cursor-pointer flex-col gap-1 rounded-r border bg-surface p-4',
                'shadow-token transition-[border-color,background-color] duration-150 ease-out-ui',
                'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent',
                checked
                  ? 'border-accent bg-surface-2'
                  : 'border-line [@media(hover:hover)and(pointer:fine)]:hover:border-line-strong',
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
              <span className="flex items-center justify-between gap-3">
                <span className="font-body text-base font-semibold text-text">
                  {opt.title}
                </span>
                {/* Tick monocromo cuando está seleccionado. */}
                <span
                  aria-hidden="true"
                  className={[
                    'grid h-5 w-5 shrink-0 place-items-center rounded-full border',
                    checked
                      ? 'border-accent bg-accent text-accent-text'
                      : 'border-line-strong',
                  ].join(' ')}
                >
                  {checked ? (
                    <svg
                      viewBox="0 0 24 24"
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                </span>
              </span>
              <span className="font-body text-sm leading-relaxed text-text-muted">
                {opt.description}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
