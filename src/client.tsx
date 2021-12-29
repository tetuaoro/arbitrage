import { config } from 'dotenv'
import React, { useState, useEffect } from 'react'
import { render, Text, Box, Static, Newline } from 'ink'
import Table from 'ink-table'
import { io } from 'socket.io-client'
import { ServerData } from './types'
import dayjs from 'dayjs'
import { IOEVENT } from './constants'
import TOKEN_ABI from './abi/IERC20-lite.json'
import { Contract, constants, providers } from 'ethers'

config()
const isDev = process.env['NODE_ENV'] == 'dev',
	staticNetwork = { name: 'matic', chainId: 137, ensAddress: null, _defaultProvider: null },
	moralis = new providers.StaticJsonRpcProvider(isDev ? null : process.env['RPC_URL'], staticNetwork),
	tokenContract = new Contract(constants.AddressZero, TOKEN_ABI, moralis)

const App = () => {
	const [socket] = useState(io(process.env['SOCKET_URL'], { autoConnect: false }))
	const [open, setOpen] = useState(false)
	const [data, setData] = useState<Partial<ServerData>>({
		STARTED_AT: 0,
		UPTIME: 0,
		BLOCKNUMBER: 0,
		AVERAGE_GBO_COMPUTE_TIME: 0,
		COUNTER_ON_BLOCK: 0,
	})
	const [tokens, setTokens] = useState([])
	const [counters, setCounters] = useState<Partial<ServerData>>({
		COUNTER_STARTED: 0,
		COUNTER_ON_BLOCK: 0,
		COUNTER_OPPORTUNITY: 0,
		COUNTER_ERROR: 0,
	})

	useEffect(() => {
		socket.on(IOEVENT.CLIENT_CONNECT, () => {
			setOpen(true)

			setTimeout(() => {
				socket.emit(IOEVENT.CLIENT_SETINTERVAL, 1e3 * 45)
			}, 2000)
		})
		socket.on(IOEVENT.CLIENT_DISCONNECT, () => {
			setOpen(false)
		})

		socket.on(IOEVENT.SERVER_DATA, async (data: ServerData) => {
			setData({
				STARTED_AT: dayjs(data.STARTED_AT).format('DD HH:mm:ss'),
				UPTIME: dayjs(data.UPTIME).format('DD HH:mm:ss'),
				BLOCKNUMBER: data.BLOCKNUMBER,
				COUNTER_ON_BLOCK: data.COUNTER_ON_BLOCK,
				AVERAGE_GBO_COMPUTE_TIME: data.AVERAGE_GBO_COMPUTE_TIME / 1000,
			})
			setCounters({
				COUNTER_STARTED: data.COUNTER_STARTED,
				COUNTER_ON_BLOCK: data.COUNTER_ON_BLOCK,
				COUNTER_OPPORTUNITY: data.COUNTER_OPPORTUNITY,
				COUNTER_ERROR: data.COUNTER_ERROR,
			})
			const tokens = {}
			for (const token of data.TOKEN_ADDRESSES) {
				const name = await tokenContract.attach(token).name()
				tokens[name] = 0
			}
			setTokens([tokens])
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
			<Newline />
			<Table data={[data as any]} />
			<Newline />
			<Table data={[counters as any]} />
			<Newline />
			<Table data={tokens} />
		</Box>
	)
}

render(<App />)
