import { config } from 'dotenv'
import { io } from 'socket.io-client'
import { IO_EVENT } from './constants'
import { ServerData, ServerOnSync } from './types'

config()
const isDevelopment = process.env['NODE_ENV'] == 'dev'
const PORT = process.env['PORT'] || 3001
const SOCKET_URL = isDevelopment ? `ws://localhost:${PORT}` : `${process.env['SOCKET_URL']}:${PORT}`
const socket = io(SOCKET_URL, {
	autoConnect: false,
})

socket.on(IO_EVENT.CLIENT_CONNECTION, () => {
	console.log(`socket connected as ${socket.id} at :${PORT}`)
})

socket.on(IO_EVENT.CLIENT_EMIT_LOG, (logs: ServerData) => {
	console.table(logs)
})

socket.on(IO_EVENT.CLIENT_CONNECTION, (onSyncData: ServerOnSync[]) => {
	console.table(onSyncData)
})

socket.on(IO_EVENT.SERVER_DISCONNECT, () => {
	process.exit()
})

const app = () => {
	console.log(`App monitor arbitrage bot`)
	socket.connect()
}

process.on('exit', () => {
	socket.close()
})

app()
