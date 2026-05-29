import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '../../lib/api'

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')
}

export function TimerBar({ roomId }) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [sessionId, setSessionId] = useState(null)
  const [busy, setBusy] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return undefined
    }

    intervalRef.current = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => currentSeconds + 1)
    }, 1000)

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning])

  async function handleToggle() {
    if (!roomId || busy) {
      return
    }

    if (isRunning) {
      setIsRunning(false)
      return
    }

    if (sessionId) {
      setIsRunning(true)
      return
    }

    setBusy(true)

    try {
      const response = await api(`/api/rooms/${roomId}/sessions/start`, {
        method: 'POST',
      })

      if (response.session?.id) {
        setSessionId(response.session.id)
        setElapsedSeconds(0)
        setIsRunning(true)
      }
    } finally {
      setBusy(false)
    }
  }

  const label = isRunning ? 'Pause' : sessionId ? 'Resume' : 'Start timer'

  return (
    <div className="rounded-2xl border border-white/10 bg-background/60 p-4">
      <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
        Timer
      </div>
      <div className="mt-2 font-heading text-4xl font-semibold tabular-nums tracking-tight">
        {formatTime(elapsedSeconds)}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        {isRunning ? 'Session running' : sessionId ? 'Session paused' : 'Ready to start a study session'}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button onClick={handleToggle} disabled={busy || !roomId}>
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {busy ? 'Starting…' : label}
        </Button>
      </div>
    </div>
  )
}
