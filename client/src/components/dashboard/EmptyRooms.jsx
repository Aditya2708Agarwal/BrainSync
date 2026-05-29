import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyRooms({ onCreate }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-card/35 p-12 text-center">
      <h3 className="font-heading text-xl font-semibold">No rooms yet</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Create your first study room to start tracking sessions.
      </p>
      <div className="mt-6">
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4" />
          Create room
        </Button>
      </div>
    </div>
  )
}
