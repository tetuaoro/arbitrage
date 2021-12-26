import { config } from 'dotenv'
import React, { useState, useEffect } from 'react'
import { render, Text, Box, Static } from 'ink'
import Table from 'ink-table'
import { io } from 'socket.io-client'
import { ServerLogs } from './types'
import dayjs from 'dayjs'

config()

const App = () => {
	const [socket] = useState(io(process.env['REACT_APP_SOCKET_URL']))
	const [open, setOpen] = useState(false)
	const [logs, setLogs] = useState<ServerLogs>({
		START_AT: 0,
		UPTIME: 0,
		BLOCKNUMBER: 0,
		COUNTER_TIME_REJECT: 0,
		COUNTER: 0,
		COUNTER_CALL: 0,
		COUNTER_SUCCESS: 0,
		COUNTER_FAIL: 0,
	})

	useEffect(() => {
		socket.on('connect', () => {
			setOpen(true)
		})
		socket.on('disconnect', () => {
			setOpen(false)
		})

		socket.on('logs', (logs: ServerLogs) => {
			setLogs({ ...logs, START_AT: dayjs(logs.START_AT).format('DD HH:mm:ss'), UPTIME: dayjs(logs.UPTIME).format('DD HH:mm:ss') })
		})

		let id = setTimeout(() => {
			socket.connect()
		}, 1500)

		return () => {
			clearTimeout(id)
			socket.close()
		}
	}, [])

	return (
		<Box flexDirection="column">
			<Static items={[{ id: 0 }]}>
				{(k) => (
					<Text key={k.id} color="yellow">
						App client start at {dayjs().format('DD/MM/YYYY HH:mm:ss')}
					</Text>
				)}
			</Static>
			<Text color={open ? 'green' : 'red'}>{open ? `connected as ${socket.id}` : 'Not connected'}</Text>
			<Table data={[logs]} />
		</Box>
	)
}

render(<App />)
