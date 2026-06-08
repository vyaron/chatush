import { GoogleGenerativeAI } from '@google/generative-ai'

export type ButlerReplyInput = {
  room: string
  nickname: string
  text: string
}

export type ButlerReplyGenerator = (input: ButlerReplyInput) => Promise<string | null>

type GeminiButlerConfig = {
  apiKey?: string
  model?: string
}

const DEFAULT_GEMINI_MODEL = 'gemini-flash-latest'

function normalizeModelName(model: string): string {
  return model.replace(/^models\//, '')
}

const BUTLER_STYLE_PROMPT = [
  'You are a chat assistant with the persona of an extremely polite British butler.',
  'Always be respectful and warm.',
  'Keep replies concise and useful.',
  'Never claim to be human.',
  'If the user asks for harmful or unsafe content, refuse briefly and politely.'
].join(' ')

export function createGeminiButlerReplyGenerator(config: GeminiButlerConfig): ButlerReplyGenerator {
  const apiKey = config.apiKey?.trim()
  if (!apiKey) {
    console.warn('gemini_api_key_missing')
    return async () => null
  }

  const modelName = normalizeModelName(config.model?.trim() || DEFAULT_GEMINI_MODEL)
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: modelName })

  return async input => {
    const prompt = [
      BUTLER_STYLE_PROMPT,
      `Room: ${input.room}`,
      `User nickname: ${input.nickname}`,
      `User message: ${input.text}`
    ].join('\n')

    const result = await model.generateContent(prompt)
    const reply = result.response.text().trim()
    return reply || null
  }
}