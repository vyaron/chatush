import { createServer } from 'node:http'
import { app } from './app.js'
import { createSocketServer } from './socket.js'

const PORT = Number(process.env.PORT ?? 3001)

const httpServer = createServer(app)
createSocketServer(httpServer)

httpServer.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`)
})
