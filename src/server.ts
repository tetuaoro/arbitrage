import { IOEVENT } from './constants'
import { BigNumber } from 'ethers'
import { Address, Reserves, Result, Flashswap, ServerData } from './types'
import { queryContract, moralis, FACTORY_ADDRESSES, ROUTER_ADDRESSES, sliceArray, getAmountOut, getAmountOutToPayback, sgMail } from './utils'
import { Server } from 'socket.io'
import cron from 'node-cron'

const TOKEN_ADDRESSES: Array<Address> = [
		'0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6', // WBTC
		'0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', // DAI
		'0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', // WETH
		'0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // WMATIC
	],
	PAIR_ADDRESSES: Array<Address> = []

const getPairsByFactory = async () => {
	console.log(`🔶 getPairsByFactory start`)
	try {
		const TOKENS = []
		for (let i = 0; i < TOKEN_ADDRESSES.length; i++) {
			for (let j = 0; j < TOKEN_ADDRESSES.length; j++) {
				if (i >= j) continue
				TOKENS.push([TOKEN_ADDRESSES[i], TOKEN_ADDRESSES[j]])
			}
		}

		const pairsByIndexRange: Array<Address> = await queryContract.getPairsByFactory(
			FACTORY_ADDRESSES,
			TOKENS,
			FACTORY_ADDRESSES.length * TOKENS.length
		)
		PAIR_ADDRESSES.push(...pairsByIndexRange)
		console.log(`💡 find ${PAIR_ADDRESSES.length}`)
	} catch (_error) {
		const error = { _error, target: getPairsByFactory.name }
		makeError(error)
	}
}

const getBestOpportunity = async (reserves: Array<Array<Reserves>>, blockNumber: number) => {
	console.log(`🔨 call getBestOpportunity at ${blockNumber}`)
	try {
		const len = reserves.length,
			sublen = reserves[0].length

		const results: Result[] = []

		const TEST_AMOUNT = [2, 5, 10, 20, 100] // 50%, 20%, 10%, 2%, 1%
		for (let i = 0; i < sublen; i++) {
			let rewardsA = BigNumber.from(0),
				rewardsB = BigNumber.from(0)
			const _results: Result[] = []
			for (let a = 0; a < len; a++) {
				for (let b = 0; b < len; b++) {
					if (a >= b) continue
					const r0A = reserves[a][i][0],
						r1A = reserves[a][i][1],
						r0B = reserves[b][i][0],
						r1B = reserves[b][i][1],
						borrow0 = r0A.gt(r1A) && r0B.gt(r1B)

					for (const percent of TEST_AMOUNT) {
						const amountInA = borrow0 ? r0A.div(percent) : r1A.div(percent), // borrow
							pathA = borrow0 ? [r0A, r1A] : [r1A, r0A],
							amountInB = borrow0 ? r0B.div(percent) : r1B.div(percent),
							pathB = borrow0 ? [r0B, r1B] : [r1B, r0B],
							amountOutA_A = getAmountOutToPayback(amountInA, pathA[0], pathA[1]),
							amountOutB_A = getAmountOut(amountInA, pathB[0], pathB[1]),
							amountOutB_B = getAmountOutToPayback(amountInB, pathB[0], pathB[1]),
							amountOutA_B = getAmountOut(amountInB, pathA[0], pathA[1]),
							aToB = amountOutA_A.lt(borrow0 ? r0B : r1B) && amountOutA_A.lt(amountOutB_A),
							bToA = amountOutB_B.lt(borrow0 ? r0A : r1B) && amountOutB_B.lt(amountOutA_B)

						if (aToB || bToA) {
							let change = false
							if (rewardsA.lt(amountOutB_A.sub(amountOutA_A))) {
								rewardsA = amountOutB_A.sub(amountOutA_A)
								change = true
							}
							if (rewardsB.lt(amountOutA_B.sub(amountOutB_B))) {
								rewardsB = amountOutA_B.sub(amountOutB_B)
								change = true
							}
							if (change) {
								const bool = rewardsA.gt(rewardsB)
								_results.push({
									exchangesIndexs: bool ? [a, b] : [b, a],
									reserveIndex: i,
									rewards: bool ? rewardsA : rewardsB,
									percent,
									borrow: bool ? amountInA : amountInB,
									repay: bool ? amountOutA_A : amountOutB_B,
									amountOut: bool ? amountOutB_A : amountOutA_B,
								})

								/* console.table({
									rA: `${r0A.toString()} / ${r1A.toString()}`,
									rB: `${r0B.toString()} / ${r1B.toString()}`,
									bool,
									aToB,
									bToA,
									rewards: bool ? rewardsA.toString() : rewardsB.toString(),
									borrow: bool ? amountInA.toString() : amountInB.toString(),
									repay: bool ? amountOutA_A.toString() : amountOutB_B.toString(),
									amountOut: bool ? amountOutB_A.toString() : amountOutA_B.toString(),
								}) */
							}
						}
					}
				}
			}

			if (_results.length > 0) {
				_results.sort((a, b) => (a.rewards.gt(b.rewards) ? -1 : 1))
				results.push(_results[0])
			}
		}
		return results
	} catch (_error) {
		const error = { _error, target: getBestOpportunity.name }
		makeError(error)
	}
}

let BLOCKNUMBER = 0,
	COUNTER_ON_BLOCK = 0,
	AVERAGE_GBO_COMPUTE_TIME = 0,
	LOCK_LISTENER_ON_BLOCK = true
const listenBlock = async () => {
	console.log(`🔶 listenBlock start`)
	try {
		const lockOnPair: Address[] = []
		moralis.on('block', async (blockNumber: number) => {
			try {
				COUNTER_ON_BLOCK++
				if (LOCK_LISTENER_ON_BLOCK || BLOCKNUMBER >= blockNumber) return
				BLOCKNUMBER = blockNumber
				const RESERVES: Array<Array<Reserves>> = []
				const reservesByPairs: Array<Reserves> = await queryContract.getReservesByPairs(PAIR_ADDRESSES)

				const t0 = Date.now()
				RESERVES.push(...sliceArray(FACTORY_ADDRESSES.length, reservesByPairs))
				const results = await getBestOpportunity(RESERVES, blockNumber)

				if (results.length > 0) {
					const _PAIR_ADDRESSES: Array<Array<Address>> = sliceArray(FACTORY_ADDRESSES.length, PAIR_ADDRESSES)
					for (let i = 0; i < results.length; i++) {
						const element = results[i],
							params: Flashswap = {
								pairBorrow: _PAIR_ADDRESSES[element.exchangesIndexs[0]][element.reserveIndex],
								pairSell: _PAIR_ADDRESSES[element.exchangesIndexs[1]][element.reserveIndex],
								routerSell: ROUTER_ADDRESSES[element.exchangesIndexs[1]],
								percent: element.percent,
								blockNumber,
								borrow: element.borrow,
								repay: element.repay,
								amountOut: element.amountOut,
							}

						if (lockOnPair.includes(params.pairBorrow) || ABUSE_PAIR.includes(params.pairBorrow)) continue
						lockOnPair.push(params.pairBorrow)

						IMMEDIATES.push(
							setImmediate(async () => {
								await flashswap(params)
								const index = lockOnPair.indexOf(params.pairBorrow),
									newArray = lockOnPair.filter((_, i) => i != index),
									ln = lockOnPair.length
								for (let i = 0; i < ln; i++) lockOnPair.pop()
								lockOnPair.push(...newArray)
							})
						)
					}
				}

				AVERAGE_GBO_COMPUTE_TIME = Date.now() - t0
			} catch (_error) {
				const error = { _error, target: 'onBlock' }
				makeError(error)
			}
		})
	} catch (_error) {
		const error = { _error, target: listenBlock.name }
		makeError(error)
	}
}

const ABUSE_PAIR: Address[] = [],
	ABUSE_PAIR_TEMP: Address[] = []
const monitoringManager = (pair: Address) => {
	ABUSE_PAIR_TEMP.push(pair)
	let counter = 0
	for (const _ of ABUSE_PAIR_TEMP) {
		counter++
		if (counter > 9) {
			ABUSE_PAIR.push(pair)
			break
		}
	}
}

let COUNTER_OPPORTUNITY = 0
const flashswap = async (params: Flashswap) => {
	console.log(`❕❕ flashswap start`)
	try {
		COUNTER_OPPORTUNITY++
		const { pairBorrow, percent, blockNumber } = params
		monitoringManager(pairBorrow)
		console.log(`💱 ${blockNumber} ${100 / percent}%`)
	} catch (_error) {
		const error = { _error, target: flashswap.name }
		makeError(error)
	}
}

let COUNTER_ERROR = 0
const makeError = (error: any) => {
	COUNTER_ERROR++
	if (error && error.target && error._error) {
		console.error(`❌ ${error.target}`)
		if (error._error.body) {
			const body = JSON.parse(error._error.body)
			console.error(`\t----miner message : ${body.error.message}`)
			console.error(`\t----network reason : ${body.error.data[body.result].reason}`)
		} else console.error(error._error)
		console.error(`❌ ${error.target}`)
	} else {
		console.error(error)
	}

	//reset
	LOCK_LISTENER_ON_BLOCK = true
	moralis.removeAllListeners()
	clearScript()
	console.log(`🔄 Restart main`)
	app()
}

const STARTED_AT = Date.now()
let COUNTER_STARTED = 0
const app = async () => {
	console.log(`🔵 App start`)
	try {
		COUNTER_STARTED++
		if (COUNTER_STARTED == 1) await getPairsByFactory() // once
		await listenBlock()
		LOCK_LISTENER_ON_BLOCK = false

		INTERVALS.push(
			setInterval(() => {
				console.log(`💬 ${COUNTER_STARTED}\t${BLOCKNUMBER}\t${COUNTER_ON_BLOCK}\t${AVERAGE_GBO_COMPUTE_TIME / 1000}`)
			}, 1e3 * 37)
		)
	} catch (_error) {
		const error = { _error, target: app.name }
		makeError(error)
	}
}

app()

const IMMEDIATES: NodeJS.Immediate[] = [],
	INTERVALS: NodeJS.Timer[] = []

const clearScript = () => {
	let ln = IMMEDIATES.length
	for (let index = 0; index < ln; index++) IMMEDIATES.pop()
	ln = INTERVALS.length
	for (let index = 0; index < ln; index++) INTERVALS.pop()
	ln = ABUSE_PAIR.length
	for (let index = 0; index < ln; index++) ABUSE_PAIR.pop()
	ln = ABUSE_PAIR_TEMP.length
	for (let index = 0; index < ln; index++) ABUSE_PAIR_TEMP.pop()
}

const PORT = process.env['PORT'],
	io = new Server(parseInt(PORT))

io.on(IOEVENT.CLIENT_CONNECTION, (socket) => {
	console.log(`new user ${socket.id}`)
	socket.on(IOEVENT.CLIENT_DISCONNECT, (_reason: any) => {
		console.log(`user ${socket.id} disconnected`)
	})
	socket.on(IOEVENT.CLIENT_SETINTERVAL, (delay: number) => {
		const sendData = () => {
			const DATA: ServerData = {
				id: socket.id,
				STARTED_AT,
				UPTIME: Date.now(),
				BLOCKNUMBER,
				LOCK_LISTENER_ON_BLOCK,
				LOCK_CLOSE,
				AVERAGE_GBO_COMPUTE_TIME,
				COUNTER_ERROR,
				COUNTER_STARTED,
				COUNTER_OPPORTUNITY,
				COUNTER_ON_BLOCK,
				ABUSE_PAIR,
				TOKEN_ADDRESSES,
				FACTORY_ADDRESSES,
				PAIR_ADDRESSES,
			}
			socket.emit(IOEVENT.SERVER_DATA, DATA)
		}
		sendData()
		INTERVALS.push(setInterval(sendData, delay || 1e3 * 30))
	})
})

let LOCK_CLOSE = false
const close = () => {
	if (LOCK_CLOSE) return
	LOCK_CLOSE = true
	console.log(`🔴 purge server`)
	clearScript()
	io.close()
	process.exit()
}

cron.schedule('59 23 * * *', async () => {
	console.log('---------------------')
	console.log('Running Cron Job')
	const msg = {
		to: process.env[''], // Change to your recipient
		from: process.env[''], // Change to your verified sender
		subject: 'Rapport bot arbitrage',
		text: `Rapport bot arbitrage ${BLOCKNUMBER}/${COUNTER_STARTED}/${
			AVERAGE_GBO_COMPUTE_TIME / 1000
		}/${COUNTER_OPPORTUNITY}/${COUNTER_ERROR}`,
		html: `
			<body>
				<h1>Rapport bot arbitrage</h1>
				<table>
					<tr>
						<td>LAST_BLOCKNUMBER</td>
						<td>COUNTER_STARTED</td>
						<td>AVERAGE_GBO_COMPUTE_TIME</td>
						<td>COUNTER_OPPORTUNITY</td>
						<td>COUNTER_ERROR</td>
					</tr>
					<tr>
						<td>${BLOCKNUMBER}</td>
						<td>${COUNTER_STARTED}</td>
						<td>${AVERAGE_GBO_COMPUTE_TIME / 1000}</td>
						<td>${COUNTER_OPPORTUNITY}</td>
						<td>${COUNTER_ERROR}</td>
					</tr>
				</table>
			</body>
		`,
	}

	await sgMail.send(msg)
})

process.on('exit', close)
process.on('SIGINT', close)
process.on('SIGTERM', close)
