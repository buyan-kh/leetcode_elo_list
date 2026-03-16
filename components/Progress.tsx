interface ProgressProps {
  value: number
}

export const Progress: React.FC<ProgressProps> = ({ value }) => (
  <div className="h-2 w-full rounded-full bg-slate-800">
    <div
      className="h-2 rounded-full bg-emerald-400 transition-all"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    />
  </div>
)
