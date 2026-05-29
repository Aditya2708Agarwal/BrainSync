import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CreateRoomDialog } from '../components/dashboard/CreateRoomDialog.jsx'
import { JoinRoomDialog } from '../components/dashboard/JoinRoomDialog.jsx'
import { DashboardShell } from '../components/dashboard/DashboardShell.jsx'
import { EmptyRooms } from '../components/dashboard/EmptyRooms.jsx'
import { ProfileRow } from '../components/dashboard/ProfileRow.jsx'
import { RoomCard } from '../components/dashboard/RoomCard.jsx'
import { StatCard } from '../components/dashboard/StatCard.jsx'
import { BrandLogo } from '../components/BrandLogo.jsx'
import { api } from '../lib/api.js'
import { getCurrentUser } from '../services/auth.js'

function formatMinutes(minutes) {
  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
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

function getFirstName(fullName) {
  if (!fullName) {
    return 'there'
  }

  return fullName.split(' ')[0]
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isCheckingSession, setIsCheckingSession] = useState(() => Boolean(localStorage.getItem('token')))
  const [rooms, setRooms] = useState([])
  const [stats, setStats] = useState(null)
  const [busy, setBusy] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/', { replace: true })
      return
    }

    let cancelled = false

    Promise.all([getCurrentUser(token), api('/api/rooms'), api('/api/me/stats')])
      .then(([userResponse, roomsResponse, statsResponse]) => {
        if (cancelled) {
          return
        }

        setUser(userResponse.user)
        setRooms(roomsResponse.rooms || [])
        setStats(statsResponse.stats || null)
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem('token')
          navigate('/', { replace: true })
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsCheckingSession(false)
          setBusy(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [navigate])

  const joinedLabel = useMemo(() => formatDate(user?.createdAt), [user?.createdAt])

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/', { replace: true })
  }

  function handleCreateRoom(room) {
    setRooms((currentRooms) => [room, ...currentRooms])
    navigate(`/rooms/${room.id}`)
  }

  function handleJoinRoom(room) {
    setRooms((currentRooms) => {
      const exists = currentRooms.some((currentRoom) => currentRoom.id === room.id)
      return exists ? currentRooms : [room, ...currentRooms]
    })
    navigate(`/rooms/${room.id}`)
  }

  if (isCheckingSession) {
    return <DashboardShell loading />
  }

  if (!user) {
    return null
  }

  const focusMinutes = stats?.todayMinutes ?? 0
  const privateRooms = rooms.filter((room) => room.isPrivate).length

  return (
    <DashboardShell>
      <div className="mx-auto max-w-7xl px-6 py-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-card/60 px-5 py-4 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <div>
              <div className="font-heading text-lg font-semibold">
                Study dashboard
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CreateRoomDialog onCreated={handleCreateRoom} />
            <JoinRoomDialog onJoined={handleJoinRoom} />
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </header>

        <main className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.9fr)]">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-card/70 p-8 shadow-[0_30px_120px_rgba(15,23,42,0.1)] backdrop-blur">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle_at_top_right, rgba(59,130,246,0.16), transparent 36%), radial-gradient(circle_at_bottom_left, rgba(14,165,233,0.12), transparent 30%)',
              }}
            />
            <div className="relative">
              <div className="text-sm text-muted-foreground">
                Welcome back, {getFirstName(user.name)}.
              </div>
              <h1 className="mt-2 max-w-2xl font-heading text-4xl font-semibold tracking-tight text-balance md:text-5xl">
                Your study room command center.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Track your sessions, create focused rooms, and keep momentum in one
                place. The layout is built to match the dashboard you shared while
                staying inside the current login flow.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <CreateRoomDialog onCreated={handleCreateRoom} triggerLabel="New room" />
                <Button variant="secondary" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Switch account
                </Button>
              </div>
            </div>
          </section>

          <Card className="border-white/10 bg-card/70 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your current signed-in session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProfileRow label="Name" value={user.name || 'Unknown'} />
              <ProfileRow label="Email" value={user.email || 'Not available'} />
              <ProfileRow label="Joined" value={joinedLabel} />
              <ProfileRow label="Status" value="Protected session" />
            </CardContent>
          </Card>
        </main>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Today" value={formatMinutes(focusMinutes)} hint="studied" />
          <StatCard label="Streak" value={`${stats?.streakDays ?? 0} days`} hint="keep it alive" />
          <StatCard label="Sessions" value={`${stats?.totalSessions ?? rooms.length}`} hint="all-time" />
          <StatCard label="Private" value={`${privateRooms}`} hint="locked rooms" />
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Recent spaces</div>
              <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
                Study rooms
              </h2>
            </div>
          </div>

          <div className="mt-5">
            {busy ? (
              <div className="text-sm text-muted-foreground">Loading rooms…</div>
            ) : rooms.length === 0 ? (
              <EmptyRooms onCreate={() => handleCreateRoom(createDefaultRoom())} />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {rooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}

function createDefaultRoom() {
  return {
    id: `room-${Date.now()}`,
    name: 'New Study Room',
    description: 'A fresh space for focused work.',
    isPrivate: false,
    memberCount: 1,
    ownerId: 'me',
    createdAt: new Date().toISOString(),
  }
}
