import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '../../lib/api'

export function CreateRoomDialog({ onCreated, triggerLabel = 'Create room' }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  function resetForm() {
    setName('')
    setDescription('')
    setIsPrivate(false)
  }

  function closeDialog() {
    setOpen(false)
    resetForm()
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      return
    }

    try {
      const response = await api('/api/rooms', {
        method: 'POST',
        body: JSON.stringify({
          name: trimmedName,
          description: description.trim(),
          isPrivate,
        }),
      })

      if (response.room) {
        onCreated(response.room)
        closeDialog()
      }
    } catch {
      // leave the form open so the user can try again
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        {triggerLabel}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-8 backdrop-blur-sm">
          <Card className="w-full max-w-lg border-white/10 bg-card/95 shadow-[0_30px_120px_rgba(15,23,42,0.22)]">
            <CardHeader>
              <CardTitle>Create a study room</CardTitle>
              <CardDescription>
                Add a room for a focused session or a private group.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="room-name">Room name</Label>
                  <Input
                    id="room-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Deep Work Sprint"
                    autoFocus
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="room-description">Description</Label>
                  <Input
                    id="room-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="What this room is for"
                  />
                </div>

                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-background/60 px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(event) => setIsPrivate(event.target.checked)}
                    className="size-4 rounded border-border"
                  />
                  Private room
                </label>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button type="submit">Create room</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  )
}
