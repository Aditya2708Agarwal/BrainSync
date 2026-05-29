import { Clock, Lock, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

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

export function RoomCard({ room, active = false }) {
  return (
    <Link
      to={`/rooms/${room.id}`}
      className={`group relative block w-full overflow-hidden rounded-2xl border bg-card/65 p-5 text-left shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-card ${
        active ? 'border-primary/40 ring-1 ring-primary/20' : 'border-white/10 hover:border-white/20'
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-lg font-semibold leading-tight">
            {room.name}
          </h3>
          {room.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {room.description}
            </p>
          ) : null}
        </div>
        {room.isPrivate ? (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-background/70 text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {room.memberCount} member{room.memberCount === 1 ? '' : 's'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {formatDate(room.createdAt)}
        </span>
      </div>
    </Link>
  )
}
