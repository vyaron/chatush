import { randomUUID } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'

declare global {
  namespace Express {
    interface Request {
      requestId: string
    }
  }
}

export function requestIdMiddleware(request: Request, _response: Response, next: NextFunction): void {
  request.requestId = request.header('x-request-id') ?? randomUUID()
  next()
}
