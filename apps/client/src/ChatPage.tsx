import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Camera,
  MoreVertical,
  Paperclip,
  Phone,
  Plus,
  SendHorizontal,
  Smile,
  Video
} from 'lucide-react'
import { io, type Socket } from 'socket.io-client'
import { toast } from 'sonner'

type ChatMessage = {
  id: string
  room: string
  nickname: string
  text: string
  createdAt: string
}

type UiMessage = {
  id: string
  text?: string
  timeLabel: string
  isMine: boolean
  fileName?: string
  fileType?: string
  fileSize?: string
}

const ROOM_LIST = ['general', 'random', 'support']
const NICKNAME_KEY = 'nickname'
const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001'

const DESIGN_THREAD: UiMessage[] = [
  { id: 'd1', text: 'Good morning!', timeLabel: '10:10', isMine: true },
  { id: 'd2', text: 'Japan looks amazing!', timeLabel: '10:10', isMine: true },
  { id: 'd3', text: 'I will write from Japan', timeLabel: '17:47', isMine: true },
  { id: 'd4', text: 'Good bye!', timeLabel: '17:47', isMine: true },
  {
    id: 'd5',
    timeLabel: '10:15',
    isMine: true,
    fileName: 'IMG_0481',
    fileType: 'png',
    fileSize: '2.8 MB'
  },
  {
    id: 'd6',
    timeLabel: '10:15',
    isMine: true,
    fileName: 'IMG_0475',
    fileType: 'png',
    fileSize: '2.4 MB'
  },
  {
    id: 'd7',
    timeLabel: '11:51',
    isMine: true,
    fileName: 'IMG_0484',
    fileType: 'png',
    fileSize: '2.6 MB'
  },
  {
    id: 'd8',
    timeLabel: '11:51',
    isMine: true,
    fileName: 'IMG_0483',
    fileType: 'png',
    fileSize: '2.8 MB'
  },
  { id: 'd9', text: 'Do you know what time is it?', timeLabel: '11:40', isMine: false },
  { id: 'd10', text: 'What is the most popular meal in Japan?', timeLabel: '11:45', isMine: false },
  { id: 'd11', text: 'It’s morning in Tokyo 😎', timeLabel: '11:43', isMine: true },
  { id: 'd12', text: 'I think top two are:', timeLabel: '11:50', isMine: true },
  { id: 'd13', text: 'Do you like it?', timeLabel: '11:45', isMine: false }
]

let socketRef: Socket | null = null

export function ChatPage() {
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

  const liveThread = useMemo<UiMessage[]>(
    () =>
      messageList.map(message => ({
        id: message.id,
        text: `${message.nickname}: ${message.text}`,
        isMine: message.nickname === nickname,
        timeLabel: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })),
    [messageList, nickname]
  )

  const timeline = useMemo<UiMessage[]>(
    () => (activeRoom === ROOM_LIST[0] ? [...DESIGN_THREAD, ...liveThread] : liveThread),
    [activeRoom, liveThread]
  )

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
        <section className='card nickname-card whatsapp-login'>
          <p className='eyebrow'>Live chat setup</p>
          <h1>Welcome to WhatsAppUI</h1>
          <p>Choose a nickname to join room conversations in real time.</p>
          <form onSubmit={onSaveNickname} className='row'>
            <input
              value={draftNickname}
              onChange={event => setDraftNickname(event.target.value)}
              placeholder='Type your nickname'
              aria-label='Nickname'
            />
            <button type='submit'>Continue</button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className='app-shell'>
      <section className='card phone-shell'>
        <header className='status-bar'>
          <span>9:41</span>
          <div className='status-icons'>
            <span className='signal-bars' aria-hidden='true'>
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className='wifi-glyph' aria-hidden='true' />
            <span className='battery-glyph' aria-hidden='true'>
              <span className='battery-level' />
            </span>
          </div>
        </header>

        <header className='contact-bar'>
          <button type='button' className='chrome-icon' aria-label='Back'>
            <ArrowLeft size={17} />
          </button>
          <img src='/figma/martha-avatar.png' alt='Martha Craig' className='contact-avatar' />
          <div className='contact-meta'>
            <h1>Martha Craig</h1>
            <p>#{activeRoom} · tap here for contact info</p>
          </div>
          <div className='contact-actions'>
            <button type='button' className='chrome-icon' aria-label='Video call'>
              <Video size={17} />
            </button>
            <button type='button' className='chrome-icon' aria-label='Call'>
              <Phone size={17} />
            </button>
            <button type='button' className='chrome-icon' aria-label='More options'>
              <MoreVertical size={17} />
            </button>
          </div>
        </header>

        <nav className='room-strip' aria-label='Chat rooms'>
          {ROOM_LIST.map(room => (
            <button
              key={room}
              type='button'
              className={room === activeRoom ? 'room-chip active' : 'room-chip'}
              onClick={() => setActiveRoom(room)}
            >
              #{room}
            </button>
          ))}
        </nav>

        <section className='thread'>
          <div className='date-pill'>Fri, Jul 26</div>

          {timeline.map(message => (
            <article key={message.id} className={message.isMine ? 'bubble mine' : 'bubble'}>
              {message.text && <p>{message.text}</p>}

              {message.fileName && (
                <div className='file-card'>
                  <div className='file-icon'>DOC</div>
                  <strong>{message.fileName}</strong>
                  <small>
                    {message.fileType} • {message.fileSize}
                  </small>
                </div>
              )}

              <footer>
                <time>{message.timeLabel}</time>
                {message.isMine && <span className='tick'>✓✓</span>}
              </footer>
            </article>
          ))}
        </section>

        <form onSubmit={onSendMessage} className='composer'>
          <button type='button' className='chrome-icon' aria-label='More'>
            <Plus size={16} />
          </button>
          <div className='compose-input'>
            <button type='button' className='chrome-icon' aria-label='Emoji'>
              <Smile size={16} />
            </button>
            <input
              value={draftMessage}
              onChange={event => setDraftMessage(event.target.value)}
              placeholder='Type your message'
              aria-label='Message'
            />
            <button type='button' className='chrome-icon' aria-label='Attach'>
              <Paperclip size={16} />
            </button>
            <button type='button' className='chrome-icon' aria-label='Camera'>
              <Camera size={16} />
            </button>
          </div>
          <button type='submit' className='send-btn' aria-label='Send message'>
            <SendHorizontal size={16} />
          </button>
        </form>

        <footer className='home-indicator'>
          <span />
        </footer>
      </section>
    </main>
  )
}
