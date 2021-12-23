import { config } from 'dotenv'
import { io } from 'socket.io-client'
import { IO_EVENT } from './constants'
import { ServerData, ServerOnSync } from './types'

config()
const isDevelopment = process.env['NODE_ENV'] == 'dev'
const url = isDevelopment ? 'http://localhost:3001' : process.env['SOCKET_URL']
const socket = io(url)

socket.on(IO_EVENT.CLIENT_CONNECTION, () => {
	console.log(`socket connected as ${socket.id}`)
})

socket.on(IO_EVENT.CLIENT_EMIT_LOG, (logs: ServerData) => {
	console.table(logs)
})

socket.on(IO_EVENT.CLIENT_CONNECTION, (onSyncData: ServerOnSync[]) => {
	console.table(onSyncData)
})

socket.on(IO_EVENT.SERVER_DECONNECTION, () => {
	process.exit()
})
