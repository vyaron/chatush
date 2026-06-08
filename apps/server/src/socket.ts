import { Server } from 'socket.io'
import type { Server as HttpServer } from 'node:http'
import { z } from 'zod'
import { chatStore } from './store.js'

const joinSchema = z.object({
  room: z.string().trim().min(1).max(64),
  nickname: z.string().trim().min(2).max(30)
})

const messageSchema = z.object({
  room: z.string().trim().min(1).max(64),
  nickname: z.string().trim().min(2).max(30),
  text: z.string().trim().min(1).max(500)
})

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: '*'
    }
  })

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

      socket.join(parsedPayload.data.room)
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
    })
  })

  return io
}
