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

  it('sends delayed butler reply when one user is in room', async () => {
    const httpServer = createServer(app)
    const ioServer = createSocketServer(httpServer, {
      butlerName: 'Reginald',
      aiReplyDelayMs: 30,
      generateButlerReply: async () => 'Certainly, sir. Delighted to assist.'
    })

    await new Promise<void>(resolve => {
      httpServer.listen(0, () => resolve())
    })

    const port = (httpServer.address() as AddressInfo).port
    const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })

    await waitForConnect(client)
    const joined = waitForEvent<{ room: string }>(client, 'room:joined')
    client.emit('room:join', { room: 'general', nickname: 'alpha' })
    await joined

    const first = waitForEvent<{ nickname: string; text: string }>(client, 'message:new')
    client.emit('message:send', { room: 'general', nickname: 'alpha', text: 'hello butler' })
    const userMessage = await first

    const second = await waitForEvent<{ nickname: string; text: string }>(client, 'message:new')

    expect(userMessage.nickname).toBe('alpha')
    expect(second.nickname).toBe('Reginald')
    expect(second.text).toContain('Certainly')

    client.disconnect()
    await new Promise<void>(resolve => ioServer.close(() => resolve()))
    await new Promise<void>(resolve => httpServer.close(() => resolve()))
  })

  it('does not send butler reply when room has multiple users', async () => {
    const httpServer = createServer(app)
    const ioServer = createSocketServer(httpServer, {
      aiReplyDelayMs: 30,
      generateButlerReply: async () => 'This should never be sent.'
    })

    await new Promise<void>(resolve => {
      httpServer.listen(0, () => resolve())
    })

    const port = (httpServer.address() as AddressInfo).port
    const clientA = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
    const clientB = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })

    await Promise.all([waitForConnect(clientA), waitForConnect(clientB)])

    const joinedA = waitForEvent<{ room: string }>(clientA, 'room:joined')
    const joinedB = waitForEvent<{ room: string }>(clientB, 'room:joined')

    clientA.emit('room:join', { room: 'general', nickname: 'alpha' })
    clientB.emit('room:join', { room: 'general', nickname: 'beta' })

    await Promise.all([joinedA, joinedB])

    const receiveOnB = waitForEvent<{ nickname: string; text: string }>(clientB, 'message:new')
    clientA.emit('message:send', { room: 'general', nickname: 'alpha', text: 'hello group' })
    const message = await receiveOnB
    expect(message.nickname).toBe('alpha')

    const maybeSecond = await waitForEventWithTimeout<{ nickname: string }>(clientB, 'message:new', 120)
    expect(maybeSecond).toBeNull()

    clientA.disconnect()
    clientB.disconnect()
    await new Promise<void>(resolve => ioServer.close(() => resolve()))
    await new Promise<void>(resolve => httpServer.close(() => resolve()))
  })

  it('cancels pending butler reply if second user joins during delay', async () => {
    const httpServer = createServer(app)
    const ioServer = createSocketServer(httpServer, {
      aiReplyDelayMs: 140,
      generateButlerReply: async () => 'Pardon me, I had prepared a reply.'
    })

    await new Promise<void>(resolve => {
      httpServer.listen(0, () => resolve())
    })

    const port = (httpServer.address() as AddressInfo).port
    const clientA = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
    const clientB = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })

    await Promise.all([waitForConnect(clientA), waitForConnect(clientB)])

    const joinedA = waitForEvent<{ room: string }>(clientA, 'room:joined')
    clientA.emit('room:join', { room: 'general', nickname: 'alpha' })
    await joinedA

    const firstMessage = waitForEvent<{ nickname: string; text: string }>(clientA, 'message:new')
    clientA.emit('message:send', { room: 'general', nickname: 'alpha', text: 'alone for now' })
    await firstMessage

    const joinedB = waitForEvent<{ room: string }>(clientB, 'room:joined')
    clientB.emit('room:join', { room: 'general', nickname: 'beta' })
    await joinedB

    const maybeButler = await waitForEventWithTimeout<{ nickname: string }>(clientA, 'message:new', 260)
    expect(maybeButler).toBeNull()

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

function waitForEventWithTimeout<T>(socket: Socket, eventName: string, timeoutMs: number): Promise<T | null> {
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      socket.off(eventName, onEvent)
      resolve(null)
    }, timeoutMs)

    function onEvent(payload: unknown): void {
      clearTimeout(timer)
      resolve(payload as T)
    }

    socket.once(eventName, onEvent)
  })
}
