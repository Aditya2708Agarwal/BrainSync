export function ProfileRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-background/60 px-4 py-3">
      <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  )
}
