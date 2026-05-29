import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Clock3, MessageSquareText, ShieldCheck, Sparkles, Users, Workflow } from 'lucide-react'
import { AppHeader } from '../components/AppHeader.jsx'

export default function Landing() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (token) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-48 -top-40 h-112 w-md rounded-full bg-primary/18 blur-3xl" />
          <div className="absolute -right-32 top-24 h-88 w-88 rounded-full bg-fuchsia-500/12 blur-3xl" />
          <div className="absolute -bottom-40 left-[32%] h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        </div>

        <section className="relative mx-auto grid max-w-7xl gap-14 px-6 pb-24 pt-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:items-center lg:pt-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              Independent study workspace
            </div>

            <h1 className="mt-6 max-w-3xl font-heading text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              A focused room for
              <span className="block bg-linear-to-r from-primary via-fuchsia-300 to-sky-300 bg-clip-text text-transparent">
                the sessions you actually finish.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              BrainSync gives you a clean study room, live chat, a session timer,
              and room history in one place. Open a room, bring people in, and let
              the work stay visible.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
              >
                Create your room
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium transition-colors hover:bg-white/10"
              >
                Continue an account
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              <MiniSignal label="Live timer" value="01:24:36" />
              <MiniSignal label="People present" value="4 in room" />
              <MiniSignal label="Today&apos;s focus" value="6h 12m" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-linear-to-br from-white/10 via-white/5 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-card/75 p-5 shadow-[0_30px_120px_rgba(15,23,42,0.22)] backdrop-blur-xl">
              <div className="rounded-[1.6rem] border border-white/5 bg-background/65 p-5">
                <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      Study room snapshot
                    </div>
                    <div className="mt-1 font-heading text-xl font-semibold">
                      Deep Work Sprint
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                    Live
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <PreviewPanel
                    title="Session"
                    value="Running"
                    detail="Pause, resume, and track focus time without leaving the room."
                  />
                  <PreviewPanel
                    title="Chat"
                    value="3 new"
                    detail="Questions, check-ins, and quick updates stay with the study room."
                  />
                  <PreviewPanel
                    title="Members"
                    value="4 active"
                    detail="See who is present and keep the group moving together."
                  />
                  <PreviewPanel
                    title="Invite"
                    value="1 tap"
                    detail="Share the room with a clean invite code instead of a long setup."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-6 pb-10">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-white/10 bg-card/65 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="grid gap-4 md:grid-cols-3">
                <ProcessCard
                  step="01"
                  title="Open a room"
                  body="Create a room for solo focus or a group session in a few seconds."
                />
                <ProcessCard
                  step="02"
                  title="Bring people in"
                  body="Share a code, join instantly, and start with the same context."
                />
                <ProcessCard
                  step="03"
                  title="Keep the pace"
                  body="Timer, chat, and live presence keep the session anchored."
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-card/65 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                What BrainSync keeps visible
              </div>
              <div className="mt-4 space-y-4">
                <DetailRow icon={<Clock3 className="h-4 w-4" />} text="Session timing with start, pause, and resume states." />
                <DetailRow icon={<MessageSquareText className="h-4 w-4" />} text="Room chat with history and live Socket.IO updates." />
                <DetailRow icon={<ShieldCheck className="h-4 w-4" />} text="Private rooms and invite-based access when you need it." />
                <DetailRow icon={<Workflow className="h-4 w-4" />} text="A dashboard-to-room flow that stays simple to navigate." />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
        BrainSync helps study sessions feel deliberate.
      </footer>
    </div>
  )
}

function MiniSignal({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-background/60 p-4">
      <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-heading text-2xl font-semibold">
        {value}
      </div>
    </div>
  )
}

function PreviewPanel({ title, value, detail }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-card/70 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </div>
      <div className="mt-2 font-heading text-2xl font-semibold">
        {value}
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {detail}
      </p>
    </div>
  )
}

function ProcessCard({ step, title, body }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-background/55 p-5">
      <div className="text-xs uppercase tracking-[0.24em] text-primary">
        {step}
      </div>
      <h3 className="mt-2 font-heading text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  )
}

function DetailRow({ icon, text }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-background/55 p-4">
      <div className="mt-0.5 inline-grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
        {icon}
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  )
}
