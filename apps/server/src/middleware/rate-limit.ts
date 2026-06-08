import type { NextFunction, Request, Response } from 'express'
import type { ApiErrorBody } from '../types.js'

const WINDOW_MS = 15_000
const MAX_REQUEST_PER_WINDOW = 120

const bucketMap = new Map<string, { count: number; windowStart: number }>()

export function rateLimitMiddleware(request: Request, response: Response, next: NextFunction): void {
  const sourceKey = request.ip ?? 'unknown'
  const now = Date.now()
  const bucket = bucketMap.get(sourceKey)

  if (!bucket || now - bucket.windowStart > WINDOW_MS) {
    bucketMap.set(sourceKey, { count: 1, windowStart: now })
    next()
    return
  }

  if (bucket.count >= MAX_REQUEST_PER_WINDOW) {
    const payload: ApiErrorBody = {
      error: {
        code: 'rate_limited',
        message: 'Too many requests, please retry shortly'
      },
      requestId: request.requestId
    }

    response.status(429).json(payload)
    return
  }

  bucket.count += 1
  next()
}
