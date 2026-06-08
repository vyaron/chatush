import { Server } from 'socket.io'
import type { Server as HttpServer } from 'node:http'
import { z } from 'zod'
import { chatStore } from './store.js'
import { createGeminiButlerReplyGenerator, type ButlerReplyGenerator } from './ai.js'

const joinSchema = z.object({
  room: z.string().trim().min(1).max(64),
  nickname: z.string().trim().min(2).max(30)
})

const messageSchema = z.object({
  room: z.string().trim().min(1).max(64),
  nickname: z.string().trim().min(2).max(30),
  text: z.string().trim().min(1).max(500)
})

const DEFAULT_BUTLER_NAME = 'Reginald'
const DEFAULT_AI_REPLY_DELAY_MS = 5000

function parseReplyDelayMs(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback
  }

  return Math.floor(parsed)
}

type SocketServerOptions = {
  butlerName?: string
  aiReplyDelayMs?: number
  generateButlerReply?: ButlerReplyGenerator
  onAiError?: (error: unknown) => void
}

export function createSocketServer(httpServer: HttpServer, options: SocketServerOptions = {}): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: '*'
    }
  })

  const butlerName = options.butlerName?.trim() || process.env.AI_BUTLER_NAME?.trim() || DEFAULT_BUTLER_NAME
  const aiReplyDelayMs = parseReplyDelayMs(
    process.env.AI_REPLY_DELAY_MS ?? String(options.aiReplyDelayMs ?? DEFAULT_AI_REPLY_DELAY_MS),
    DEFAULT_AI_REPLY_DELAY_MS
  )
  const generateButlerReply = options.generateButlerReply ?? createGeminiButlerReplyGenerator({
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL
  })
  const onAiError = options.onAiError ?? (() => {})

  const socketRoomMap = new Map<string, string>()
  const roomMemberCountMap = new Map<string, number>()

  function getRoomMemberCount(room: string): number {
    return roomMemberCountMap.get(room) ?? 0
  }

  function incrementRoomMember(room: string): void {
    const current = getRoomMemberCount(room)
    roomMemberCountMap.set(room, current + 1)
  }

  function decrementRoomMember(room: string): void {
    const current = getRoomMemberCount(room)
    if (current <= 1) {
      roomMemberCountMap.delete(room)
      return
    }

    roomMemberCountMap.set(room, current - 1)
  }

  io.on('connection', socket => {
    socket.on('room:join', payload => {
      const parsedPayload = joinSchema.safeParse(payload)
      if (!parsedPayload.success) {
        socket.emit('error:event', {
          code: 'invalid_join_payload',
          message: 'Join payload is invalid'
        })
        return
      }

      const previousRoom = socketRoomMap.get(socket.id)
      if (previousRoom && previousRoom !== parsedPayload.data.room) {
        socket.leave(previousRoom)
        decrementRoomMember(previousRoom)
      }

      if (!previousRoom || previousRoom !== parsedPayload.data.room) {
        socket.join(parsedPayload.data.room)
        incrementRoomMember(parsedPayload.data.room)
      }

      socketRoomMap.set(socket.id, parsedPayload.data.room)

      socket.emit('room:joined', { room: parsedPayload.data.room })
      socket.to(parsedPayload.data.room).emit('room:user-joined', {
        room: parsedPayload.data.room,
        nickname: parsedPayload.data.nickname
      })
    })

    socket.on('message:send', payload => {
      const parsedPayload = messageSchema.safeParse(payload)
      if (!parsedPayload.success) {
        socket.emit('error:event', {
          code: 'invalid_message_payload',
          message: 'Message payload is invalid'
        })
        return
      }

      const message = chatStore.addMessage(parsedPayload.data)
      io.to(parsedPayload.data.room).emit('message:new', message)

      if (getRoomMemberCount(parsedPayload.data.room) !== 1) {
        return
      }

      setTimeout(async () => {
        if (getRoomMemberCount(parsedPayload.data.room) !== 1) {
          return
        }

        try {
          const replyText = await generateButlerReply(parsedPayload.data)
          if (!replyText) {
            return
          }

          const botMessage = chatStore.addMessage({
            room: parsedPayload.data.room,
            nickname: butlerName,
            text: replyText
          })

          io.to(parsedPayload.data.room).emit('message:new', botMessage)
        } catch (error) {
          console.error('ai_reply_failed', error)
          onAiError(error)
        }
      }, aiReplyDelayMs)
    })

    socket.on('disconnect', () => {
      const room = socketRoomMap.get(socket.id)
      if (!room) {
        return
      }

      decrementRoomMember(room)
      socketRoomMap.delete(socket.id)
    })
  })

  return io
}
