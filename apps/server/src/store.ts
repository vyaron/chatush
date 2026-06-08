import { randomUUID } from 'node:crypto'
import type { ChatMessage } from './types.js'

const MAX_MESSAGE_PER_ROOM = 200

class InMemoryChatStore {
  private readonly roomMessageMap = new Map<string, ChatMessage[]>()

  getMessages(room: string): ChatMessage[] {
    const roomMessages = this.roomMessageMap.get(room) ?? []
    return roomMessages
  }

  addMessage(input: { room: string; nickname: string; text: string }): ChatMessage {
    const message: ChatMessage = {
      id: randomUUID(),
      room: input.room,
      nickname: input.nickname,
      text: input.text,
      createdAt: new Date().toISOString()
    }

    const currentMessages = this.roomMessageMap.get(input.room) ?? []
    const nextMessages = [...currentMessages, message].slice(-MAX_MESSAGE_PER_ROOM)
    this.roomMessageMap.set(input.room, nextMessages)

    return message
  }

  clear(): void {
    this.roomMessageMap.clear()
  }
}

export const chatStore = new InMemoryChatStore()
