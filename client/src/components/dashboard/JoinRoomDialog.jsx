import { useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight } from 'lucide-react'
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

export function JoinRoomDialog({ onJoined, triggerLabel = 'Join room' }) {
  const [open, setOpen] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function closeDialog() {
    setOpen(false)
    setInviteCode('')
    setBusy(false)
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const trimmedCode = inviteCode.trim()

    if (!trimmedCode) {
      setError('Invite code is required')
      return
    }

    setBusy(true)
    setError('')

    try {
      const response = await api('/api/rooms/join', {
        method: 'POST',
        body: JSON.stringify({ inviteCode: trimmedCode }),
      })

      if (response.room) {
        onJoined(response.room)
        closeDialog()
      }
    } catch (joinError) {
      setError(joinError.message || 'Could not join room')
      setBusy(false)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <ArrowRight className="h-4 w-4" />
        {triggerLabel}
      </Button>

      {open
        ? createPortal(
            <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-md">
              <Card className="relative w-full max-w-lg border-white/10 bg-card/95 shadow-[0_30px_120px_rgba(15,23,42,0.28)]">
                <CardHeader>
                  <CardTitle>Join a study room</CardTitle>
                  <CardDescription>
                    Enter the invite code shared by another member.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="invite-code">Invite code</Label>
                      <Input
                        id="invite-code"
                        value={inviteCode}
                        onChange={(event) => setInviteCode(event.target.value)}
                        placeholder="a1b2c3d4e5"
                        autoFocus
                        required
                      />
                    </div>

                    {error ? <p className="text-sm text-red-500">{error}</p> : null}

                    <div className="flex flex-wrap justify-end gap-2">
                      <Button type="button" variant="outline" onClick={closeDialog} disabled={busy}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={busy}>
                        {busy ? 'Joining…' : 'Join room'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
