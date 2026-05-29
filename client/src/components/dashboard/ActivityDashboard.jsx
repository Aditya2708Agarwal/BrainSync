import { useEffect, useMemo, useRef, useState } from 'react'
import { Clock3, LogIn, LogOut, Play, Pause, Sparkles } from 'lucide-react'
import { api } from '../../lib/api'
import { getSocket } from '../../lib/socket'

const activityMeta = {
  join: {
    label: 'Joined room',
    icon: LogIn,
  },
  leave: {
    label: 'Left room',
    icon: LogOut,
  },
  session_start: {
    label: 'Started timer',
    icon: Play,
  },
  session_end: {
    label: 'Stopped timer',
    icon: Pause,
  },
  room_created: {
    label: 'Created room',
    icon: Sparkles,
  },
}

export function ActivityDashboard({ roomId, onMemberCountChange }) {
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const scrollerRef = useRef(null)

  useEffect(() => {
    if (!roomId) {
      setActivity([])
      setLoading(false)
      return undefined
    }

    let cancelled = false
    setLoading(true)

    api(`/api/rooms/${roomId}/activity`)
      .then((response) => {
        if (!cancelled) {
          setActivity(response.activity || [])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setActivity([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    const socket = getSocket()

    function handleActivity(event) {
      if (event.roomId !== roomId) {
        return
      }

      setActivity((currentActivity) => {
        const nextActivity = [event, ...currentActivity.filter((item) => item.id !== event.id)]
        return nextActivity.slice(0, 8)
      })
    }

    function handleRoomStats(stats) {
      if (stats.roomId !== roomId || typeof onMemberCountChange !== 'function') {
        return
      }

      onMemberCountChange(stats.memberCount)
    }

    socket.on('room:activity', handleActivity)
    socket.on('room:stats', handleRoomStats)

    return () => {
      cancelled = true
      socket.off('room:activity', handleActivity)
      socket.off('room:stats', handleRoomStats)
    }
  }, [onMemberCountChange, roomId])

  const items = useMemo(() => activity.slice(0, 8), [activity])

  useEffect(() => {
    const scroller = scrollerRef.current

    if (!scroller) {
      return
    }

    scroller.scrollTop = 0
  }, [items.length])

  return (
    <div className="flex h-full min-h-0 max-h-136 flex-col overflow-hidden rounded-3xl border border-white/10 bg-card/70 backdrop-blur">
      <div className="border-b border-white/5 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Activity dashboard
            </div>
            <div className="mt-1 text-sm font-medium text-foreground">
              Live room updates
            </div>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-300">
            <Clock3 className="h-3 w-3" />
            Live
          </span>
        </div>
      </div>

      <div ref={scrollerRef} className="flex-1 min-h-0 space-y-3 overflow-y-auto px-5 py-4">
        {loading ? (
          <div className="grid min-h-48 place-items-center text-sm text-muted-foreground">
            Loading activity…
          </div>
        ) : items.length === 0 ? (
          <div className="grid min-h-48 place-items-center text-center text-sm text-muted-foreground">
            Activity will appear here when people join, leave, or start sessions.
          </div>
        ) : (
          items.map((item) => {
            const meta = activityMeta[item.type] || activityMeta.join
            const Icon = meta.icon

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-2xl border border-white/5 bg-background/55 p-4"
              >
                <div className="mt-0.5 inline-grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-medium text-foreground">
                      {item.userName}
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {meta.label}
                    </span>
                  </div>

                  <div className="mt-1 text-sm leading-6 text-muted-foreground">
                    {describeActivity(item)}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function describeActivity(item) {
  const time = formatRelativeTime(item.createdAt)

  if (item.type === 'session_end' && item.meta?.durationMs) {
    const minutes = Math.max(1, Math.round(item.meta.durationMs / 60000))
    return `Completed a ${minutes}-minute session ${time}`
  }

  if (item.type === 'session_start') {
    return `Started a focus session ${time}`
  }

  if (item.type === 'room_created') {
    return `Created this room ${time}`
  }

  return `${time}`
}

function formatRelativeTime(dateValue) {
  if (!dateValue) {
    return 'just now'
  }

  const elapsedMs = Date.now() - new Date(dateValue).getTime()
  const elapsedMinutes = Math.round(elapsedMs / 60000)

  if (elapsedMinutes < 1) {
    return 'just now'
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m ago`
  }

  const elapsedHours = Math.round(elapsedMinutes / 60)

  if (elapsedHours < 24) {
    return `${elapsedHours}h ago`
  }

  const elapsedDays = Math.round(elapsedHours / 24)
  return `${elapsedDays}d ago`
}