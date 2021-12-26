import { config } from 'dotenv'
import { io } from 'socket.io-client'
import { ServerLogs } from './types'
import dayjs from 'dayjs'

config()

const app = async () => {
	console.log(`App client start`)
	try {
		const PORT = 3101,
			SOCKET_URL = process.env['SOCKET_URL'],
			socket = io(SOCKET_URL, {
				autoConnect: false,
				// port: PORT,
			})

		socket.on('logs', (logs: ServerLogs) => {
			let table = {
                ...logs,
				START_AT: dayjs(logs.START_AT).format('DD/MM/YYYY HH:mm:ss'),
				UPTIME: dayjs(logs.UPTIME).format('DD/MM/YYYY HH:mm:ss'),
			}
			console.table(table)
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
			console.log(`disconnected ${socket.id}`)
			socket.close()
		})
	} catch (error) {
		console.error(error)
	}
}

app()
