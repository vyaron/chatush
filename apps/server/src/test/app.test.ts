import { afterEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createServer } from 'node:http'
import { io as ioClient, type Socket } from 'socket.io-client'
import { AddressInfo } from 'node:net'
import { app } from '../app.js'
import { chatStore } from '../store.js'
import { createSocketServer } from '../socket.js'

afterEach(() => {
  chatStore.clear()
})

describe('api', () => {
  it('returns health ok', async () => {
    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body.status).toBe('ok')
  })

  it('returns 422 for invalid message payload', async () => {
    const response = await request(app)
      .post('/api/room/general/message')
      .send({ nickname: 'ab', text: '' })

    expect(response.status).toBe(422)
    expect(response.body.error.code).toBe('invalid_message_input')
    expect(response.body.requestId).toBeTypeOf('string')
  })

  it('posts and reads room message history', async () => {
    await request(app)
      .post('/api/room/general/message')
      .send({ nickname: 'adam', text: 'hello room' })
      .expect(201)

    const response = await request(app).get('/api/room/general/message')

    expect(response.status).toBe(200)
    expect(response.body.messageList).toHaveLength(1)
    expect(response.body.messageList[0].text).toBe('hello room')
  })
})

describe('socket realtime', () => {
  it('broadcasts message to room members', async () => {
    const httpServer = createServer(app)
    const ioServer = createSocketServer(httpServer)

    await new Promise<void>(resolve => {
      httpServer.listen(0, () => resolve())
    })

    const port = (httpServer.address() as AddressInfo).port

    const clientA = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
    const clientB = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })

    await Promise.all([
      waitForConnect(clientA),
      waitForConnect(clientB)
    ])

    const joinedA = waitForEvent<{ room: string }>(clientA, 'room:joined')
    const joinedB = waitForEvent<{ room: string }>(clientB, 'room:joined')

    clientA.emit('room:join', { room: 'general', nickname: 'alpha' })
    clientB.emit('room:join', { room: 'general', nickname: 'beta' })

    await Promise.all([joinedA, joinedB])

    const received = await new Promise<{ text: string }>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('message:new not received in time')), 4000)

      clientB.once('message:new', payload => {
        clearTimeout(timer)
        resolve(payload as { text: string })
      })

      clientA.emit('message:send', { room: 'general', nickname: 'alpha', text: 'realtime hi' })
    })

    expect(received.text).toBe('realtime hi')

    clientA.disconnect()
    clientB.disconnect()
    await new Promise<void>(resolve => ioServer.close(() => resolve()))
    await new Promise<void>(resolve => httpServer.close(() => resolve()))
  })
})

function waitForConnect(socket: Socket): Promise<void> {
  return new Promise(resolve => {
    socket.on('connect', () => resolve())
  })
}

function waitForEvent<T>(socket: Socket, eventName: string): Promise<T> {
  return new Promise(resolve => {
    socket.once(eventName, payload => {
      resolve(payload as T)
    })
  })
}
