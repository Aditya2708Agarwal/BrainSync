import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock3, Copy, Lock, Sparkles, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BrandLogo } from '../components/BrandLogo.jsx'
import { ActivityDashboard } from '../components/dashboard/ActivityDashboard.jsx'
import { ChatPanel } from '../components/dashboard/ChatPanel.jsx'
import { DashboardShell } from '../components/dashboard/DashboardShell.jsx'
import { TimerBar } from '../components/dashboard/TimerBar.jsx'
import { api } from '../lib/api'
import { getCurrentUser } from '../services/auth.js'

export default function RoomPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [room, setRoom] = useState(null)
  const [memberCount, setMemberCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/', { replace: true })
      return
    }

    let cancelled = false

    Promise.all([getCurrentUser(token), api(`/api/rooms/${id}`)])
      .then(([userResponse, roomResponse]) => {
        if (cancelled) {
          return
        }

        setUser(userResponse.user)
        setRoom(roomResponse.room)
        setMemberCount(roomResponse.room.memberCount || roomResponse.room.members?.length || 0)
      })
      .catch(() => {
        if (!cancelled) {
          navigate('/dashboard', { replace: true })
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [id, navigate])

  const roomTitle = room?.name || 'Room'
  const inviteCode = room?.inviteCode || 'N/A'

  const roomSummary = useMemo(() => {
    if (!room) {
      return ''
    }

    return room.description || 'No description yet.'
  }, [room])

  if (loading) {
    return <DashboardShell loading />
  }

  if (!room || !user) {
    return null
  }

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col overflow-hidden px-6 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <BrandLogo size="sm" />
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Room workspace
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:min-h-0">
          <Card className="border-white/10 bg-card/70 backdrop-blur">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-3xl">{roomTitle}</CardTitle>
                  <CardDescription className="mt-2 max-w-2xl text-base">
                    {roomSummary}
                  </CardDescription>
                </div>
                {room.isPrivate ? (
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-background/70 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </span>
                ) : null}
              </div>
            </CardHeader>

            <CardContent className="space-y-4 p-5">
              <TimerBar roomId={room.id} />

              <div className="grid gap-4 sm:grid-cols-3">
                <InfoPill icon={<Users className="h-4 w-4" />} label="Members" value={`${memberCount}`} />
                <InfoPill icon={<Clock3 className="h-4 w-4" />} label="Created" value={formatDate(room.createdAt)} />
                <InfoPill icon={<Copy className="h-4 w-4" />} label="Invite" value={inviteCode} />
              </div>
            </CardContent>
          </Card>

          <ActivityDashboard roomId={room.id} onMemberCountChange={setMemberCount} />
        </section>

        <section className="mt-6 grid min-h-0 flex-1 gap-6 overflow-hidden lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <ChatPanel roomId={room.id} roomName={room.name} currentUserId={user.id} />

          <Card className="min-h-0 overflow-hidden border-white/10 bg-card/70 backdrop-blur">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle>Room info</CardTitle>
              <CardDescription>Live room state and access details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <MetaRow label="Owner" value={room.ownerId} />
              <MetaRow label="Private" value={room.isPrivate ? 'Yes' : 'No'} />
              <MetaRow label="Current user" value={user.name} />
              <MetaRow label="Members" value={`${memberCount}`} />
              <MetaRow label="Invite code" value={inviteCode} />
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardShell>
  )
}

function formatDate(dateValue) {
  if (!dateValue) {
    return 'Recently'
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateValue))
}

function InfoPill({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-background/60 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 break-all text-sm font-medium">{value}</div>
    </div>
  )
}

function MetaRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-background/60 px-4 py-3">
      <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
