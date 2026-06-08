export type ChatMessage = {
  id: string
  room: string
  nickname: string
  text: string
  createdAt: string
}

export type ApiErrorBody = {
  error: {
    code: string
    message: string
    details?: unknown
  }
  requestId: string
}
