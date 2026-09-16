import type { Unit } from '../types/weather';

interface UnitToggleProps {
  value: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ value, onChange }: UnitToggleProps) {
  return (
    <fieldset className="flex items-center gap-2" aria-label="Unidade de temperatura">
      <legend className="sr-only">Unidade de temperatura</legend>
      {(['celsius', 'fahrenheit'] as const).map((unit) => {
        const isActive = value === unit;
        const label = unit === 'celsius' ? '°C' : '°F';

        return (
          <button
            key={unit}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(unit)}
            className={`min-w-12 rounded-xl border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-accent-400/60 ${
              isActive
                ? 'border-accent-400 bg-accent-500 text-white'
                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {label}
          </button>
        );
      })}
    </fieldset>
  );
}
