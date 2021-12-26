import { config } from 'dotenv'
import { io } from 'socket.io-client'
import { ServerLogs } from './types'

config()

const app = async () => {
	console.log(`App client start`)
	try {
		const PORT = 3001,
			SOCKET_URL = process.env['SOCKET_URL'],
			socket = io(SOCKET_URL, {
				autoConnect: false,
				// port: PORT,
			})

		socket.on('logs', (logs: ServerLogs) => {
			console.table(logs)
		})

		socket.on('connect', () => {
			console.log(`i'm ${socket.id}`)
		})

		socket.on('connect_error', (error) => {
			console.error(error.message)
		})

		console.log(`client listening at ${SOCKET_URL} /${PORT}`)
		socket.connect()

		process.on('exit', () => {
			socket.close()
		})
	} catch (error) {
		console.error(error)
	}
}

app()
