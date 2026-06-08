import express, { type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import { z } from 'zod'
import { chatStore } from './store.js'
import type { ApiErrorBody } from './types.js'
import { requestIdMiddleware } from './middleware/request-id.js'
import { rateLimitMiddleware } from './middleware/rate-limit.js'

const roomSchema = z.string().trim().min(1).max(64)
const messageInputSchema = z.object({
  nickname: z.string().trim().min(2).max(30),
  text: z.string().trim().min(1).max(500)
})

export const app = express()

app.use(cors())
app.use(express.json())
app.use(requestIdMiddleware)
app.use(rateLimitMiddleware)

app.get('/api/health', (_request, response) => {
  response.status(200).json({ status: 'ok' })
})

app.get('/api/room/:room/message', (request, response, next) => {
  const roomResult = roomSchema.safeParse(request.params.room)
  if (!roomResult.success) {
    next({
      status: 422,
      code: 'invalid_room',
      message: 'Room is invalid',
      details: roomResult.error.issues
    })
    return
  }

  const messageList = chatStore.getMessages(roomResult.data)
  response.status(200).json({ messageList })
})

app.post('/api/room/:room/message', (request, response, next) => {
  const roomResult = roomSchema.safeParse(request.params.room)
  if (!roomResult.success) {
    next({
      status: 422,
      code: 'invalid_room',
      message: 'Room is invalid',
      details: roomResult.error.issues
    })
    return
  }

  const inputResult = messageInputSchema.safeParse(request.body)
  if (!inputResult.success) {
    next({
      status: 422,
      code: 'invalid_message_input',
      message: 'Message payload is invalid',
      details: inputResult.error.issues
    })
    return
  }

  const message = chatStore.addMessage({
    room: roomResult.data,
    nickname: inputResult.data.nickname,
    text: inputResult.data.text
  })

  response.status(201).json({ message })
})

app.use((error: unknown, request: Request, response: Response, _next: NextFunction) => {
  if (typeof error === 'object' && error && 'status' in error) {
    const knownError = error as {
      status: number
      code: string
      message: string
      details?: unknown
    }

    const payload: ApiErrorBody = {
      error: {
        code: knownError.code,
        message: knownError.message,
        details: knownError.details
      },
      requestId: request.requestId
    }

    response.status(knownError.status).json(payload)
    return
  }

  const payload: ApiErrorBody = {
    error: {
      code: 'internal_error',
      message: 'Unexpected server error'
    },
    requestId: request.requestId
  }

  response.status(500).json(payload)
})
