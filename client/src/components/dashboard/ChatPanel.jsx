import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '../../lib/api'
import { getSocket } from '../../lib/socket'

export function ChatPanel({ roomId, roomName, currentUserId }) {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const scrollerRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!roomId) {
      return undefined
    }

    let cancelled = false

    Promise.resolve().then(() => {
      if (!cancelled) {
        setLoading(true)
        setError('')
      }
    })

    api(`/api/rooms/${roomId}/messages`)
      .then((res) => {
        if (!cancelled) {
          setMessages(res.messages || [])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMessages([])
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
  }, [roomId])

  useEffect(() => {
    if (!roomId) {
      return undefined
    }

    const socket = getSocket()
    const onMessage = (message) => {
      if (message.roomId !== roomId) {
        return
      }

      setMessages((currentMessages) => [...currentMessages, message])
    }

    socket.emit('room:join', { roomId })
    socket.on('chat:message', onMessage)

    return () => {
      socket.off('chat:message', onMessage)
      socket.emit('room:leave', { roomId })
    }
  }, [roomId])

  useEffect(() => {
    const scroller = scrollerRef.current

    if (!scroller) {
      return
    }

    scroller.scrollTop = scroller.scrollHeight
  }, [messages.length])

  async function send(event) {
    event.preventDefault()

    const text = draft.trim()

    if (!text || !roomId) {
      return
    }

    const socket = getSocket()

    socket.emit('chat:send', { roomId, text }, (response) => {
      if (response?.error) {
        setError(response.error)
        return
      }

      setDraft('')
      setError('')
    })
  }

  return (
    <div className="flex h-full min-h-0 flex-col max-h-127 overflow-hidden rounded-3xl border border-white/5 bg-card/60">
      <div className="border-b border-white/5 px-5 py-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          Room chat
        </div>
        <div className="mt-1 text-sm font-medium">
          {roomName || 'Select a room to start chatting'}
        </div>
      </div>

      <div ref={scrollerRef} className="scrollbar-thin flex-1 min-h-0 space-y-3 overflow-y-auto px-5 py-4">
        {!roomId ? (
          <div className="grid h-full min-h-96 place-items-center text-center text-sm text-muted-foreground">
            Pick a room from the list to view messages.
          </div>
        ) : loading ? (
          <div className="grid h-full min-h-96 place-items-center text-sm text-muted-foreground">
            Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <div className="grid h-full min-h-96 place-items-center text-center text-sm text-muted-foreground">
            No messages yet. Say hi 👋
          </div>
        ) : (
          messages.map((message) => {
            const mine = message.userId === currentUserId

            return (
              <div
                key={message.id}
                className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
              >
                <div className="mb-0.5 text-xs text-muted-foreground">
                  {message.userName}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    mine
                      ? 'rounded-br-sm bg-primary text-primary-foreground'
                      : 'rounded-bl-sm bg-white/5 text-foreground'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 border-t border-white/5 p-3">
        <Input
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            if (error) {
              setError('')
            }
          }}
          placeholder={roomId ? 'Type a message…' : 'Select a room first'}
          maxLength={500}
          disabled={!roomId}
        />
        <Button type="submit" size="icon" disabled={!roomId || !draft.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
      {error ? <div className="px-5 pb-4 text-xs text-red-500">{error}</div> : null}
    </div>
  )
}