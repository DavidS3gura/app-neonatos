interface ScaleInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  max?: number;
}

export default function ScaleInput({ label, value, onChange, max = 5 }: ScaleInputProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      <div className="flex gap-3 flex-wrap">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`scale-button ${value === n ? 'scale-button-active' : 'scale-button-inactive'}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
