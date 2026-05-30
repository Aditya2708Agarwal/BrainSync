export function DashboardShell({ loading = false, children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className="absolute inset-0 z-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }}
      />
      {loading ? (
        <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-20 text-sm text-muted-foreground">
          Loading dashboard…

          Please wait for 20-30 seconds as we are using a free hosting service that may take some time to wake up. If you continue to see this message after a minute, please refresh the page.
        </div>
      ) : (
        <div className="relative z-10">{children}</div>
      )}
    </div>
  )
}
