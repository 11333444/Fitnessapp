export function ProgressBar({
  label,
  completed,
  total,
  percent,
}: {
  label: string;
  completed: number;
  total: number;
  percent: number;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900 to-zinc-950 p-4 shadow-sm shadow-black/20">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-zinc-400">{label}</span>
        <span className="text-xs text-zinc-500">
          {completed}/{total}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-semibold tracking-tight text-zinc-50">{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
