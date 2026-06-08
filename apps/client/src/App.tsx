import { FormEvent, useEffect, useMemo, useState } from 'react'
import { LogOut, MessageCircle, SendHorizontal, Users } from 'lucide-react'
import { io, type Socket } from 'socket.io-client'
import { toast } from 'sonner'

type ChatMessage = {
  id: string
  room: string
  nickname: string
  text: string
  createdAt: string
}

const ROOM_LIST = ['general', 'random', 'support']
const NICKNAME_KEY = 'nickname'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001'

let socketRef: Socket | null = null

export function App() {
  const [nickname, setNickname] = useState<string>(() => localStorage.getItem(NICKNAME_KEY) ?? '')
  const [draftNickname, setDraftNickname] = useState('')
  const [activeRoom, setActiveRoom] = useState(ROOM_LIST[0])
  const [messageList, setMessageList] = useState<ChatMessage[]>([])
  const [draftMessage, setDraftMessage] = useState('')

  const isReady = nickname.trim().length >= 2

  useEffect(() => {
    if (!isReady) {
      return
    }

    const socket = io(API_URL, { transports: ['websocket'] })
    socketRef = socket

    socket.on('connect', () => {
      socket.emit('room:join', { room: activeRoom, nickname })
    })

    socket.on('message:new', payload => {
      const incoming = payload as ChatMessage
      setMessageList(current => {
        if (current.some(message => message.id === incoming.id)) {
          return current
        }

        return [...current, incoming]
      })
    })

    socket.on('room:user-joined', payload => {
      const { nickname: who, room } = payload as { nickname: string; room: string }
      if (room === activeRoom) {
        toast.success(`${who} joined #${room}`)
      }
    })

    socket.on('error:event', payload => {
      const body = payload as { message: string }
      toast.error(body.message)
    })

    return () => {
      socket.disconnect()
      socketRef = null
    }
  }, [activeRoom, isReady, nickname])

  useEffect(() => {
    if (!isReady) {
      return
    }

    fetch(`${API_URL}/api/room/${encodeURIComponent(activeRoom)}/message`)
      .then(async response => {
        if (!response.ok) {
          throw new Error('Failed to load room history')
        }

        const payload = (await response.json()) as { messageList: ChatMessage[] }
        setMessageList(payload.messageList)
      })
      .catch(() => {
        toast.error('Could not load room history')
      })
  }, [activeRoom, isReady, nickname])

  const roomCountLabel = useMemo(() => `${ROOM_LIST.length} rooms`, [])

  function onSaveNickname(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextNickname = draftNickname.trim()
    if (nextNickname.length < 2) {
      toast.error('Nickname must be at least 2 characters')
      return
    }

    localStorage.setItem(NICKNAME_KEY, nextNickname)
    setNickname(nextNickname)
    setDraftNickname('')
  }

  function onLogout() {
    localStorage.removeItem(NICKNAME_KEY)
    setNickname('')
    setMessageList([])
    setDraftMessage('')
  }

  function onSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextMessage = draftMessage.trim()
    if (!nextMessage) {
      return
    }

    socketRef?.emit('message:send', {
      room: activeRoom,
      nickname,
      text: nextMessage
    })

    setDraftMessage('')
  }

  if (!isReady) {
    return (
      <main className='app-shell'>
        <section className='card nickname-card'>
          <h1>Debate Room</h1>
          <p>Pick a nickname to join live room discussions.</p>
          <form onSubmit={onSaveNickname} className='row'>
            <input
              value={draftNickname}
              onChange={event => setDraftNickname(event.target.value)}
              placeholder='Enter nickname'
              aria-label='Nickname'
            />
            <button type='submit'>Join</button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className='app-shell'>
      <section className='card chat-layout'>
        <header className='chat-header'>
          <div>
            <h1>Debate Room</h1>
            <p>Signed in as <strong>{nickname}</strong></p>
          </div>
          <button type='button' className='ghost' onClick={onLogout}>
            <LogOut size={16} /> Logout
          </button>
        </header>

        <div className='room-bar'>
          <span><Users size={14} /> {roomCountLabel}</span>
          <div className='room-chip-list'>
            {ROOM_LIST.map(room => (
              <button
                key={room}
                className={room === activeRoom ? 'chip active' : 'chip'}
                onClick={() => setActiveRoom(room)}
                type='button'
              >
                {room}
              </button>
            ))}
          </div>
        </div>

        <section className='message-list'>
          {messageList.map(message => (
            <article key={message.id} className='message-item'>
              <header>
                <span className='nick'>{message.nickname}</span>
                <time>{new Date(message.createdAt).toLocaleTimeString()}</time>
              </header>
              <p>{message.text}</p>
            </article>
          ))}
          {messageList.length === 0 && (
            <p className='empty'><MessageCircle size={16} /> No messages yet. Start the room.</p>
          )}
        </section>

        <form onSubmit={onSendMessage} className='composer'>
          <input
            value={draftMessage}
            onChange={event => setDraftMessage(event.target.value)}
            placeholder={`Message #${activeRoom}`}
            aria-label='Message'
          />
          <button type='submit'>
            <SendHorizontal size={16} /> Send
          </button>
        </form>
      </section>
    </main>
  )
}
