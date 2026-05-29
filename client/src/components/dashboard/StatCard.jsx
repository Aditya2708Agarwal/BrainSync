export function StatCard({ label, value, hint }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/65 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-heading text-3xl font-semibold tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  )
}
