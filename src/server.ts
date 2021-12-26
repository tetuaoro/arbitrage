import { BigNumber, Contract, Event, utils } from 'ethers'
import { getToken, provider, getNameExchange, sgMail } from './utils'
import { onSyncInfos, ServerLogs } from './types'
import FlashswapV2 from './flashswap'

import { createServer } from 'http'
import { Server } from 'socket.io'

let BLOCKNUMBER = 0,
	COUNTER_SUCCESS = 0,
	COUNTER_CALL = 0,
	COUNTER_FAIL = 0,
	COUNTER_TIME_REJECT = 0,
	COUNTER = 0,
	LOCK_ON_SYNC = true
const onSync = async (infos: onSyncInfos, _r0: any, _r1: any, event: Event) => {
	try {
		COUNTER_CALL++
		if (LOCK_ON_SYNC || event.blockNumber <= BLOCKNUMBER) return
		BLOCKNUMBER = event.blockNumber // also lockable

		const { pair: pc, pairs: others, token1 } = infos

		const [reserve0, reserve1, ts]: [BigNumber, BigNumber, number] = await pc.getReserves()

		if (Date.now() / 1000 - ts > 5) {
			COUNTER_TIME_REJECT++
			return
		}

		const onePercent = reserve0.div(100),
			twoPercent = reserve0.div(50),
			fivePercent = reserve0.div(20),
			tenPercent = reserve0.div(10),
			twentyPercent = reserve0.div(5),
			fiftyPercent = reserve0.div(2),
			percents = [onePercent, twoPercent, fivePercent, tenPercent, twentyPercent, fiftyPercent]

		const amountsPayback: BigNumber[] = []
		for (const amountInPercent of percents) amountsPayback.push(reserve1.mul(1000).mul(amountInPercent).div(reserve0.mul(997)).add(1))

		const promiseReserveOthers: Promise<[BigNumber, BigNumber, number]>[] = []
		for (const pair of others) promiseReserveOthers.push(pair.getReserves())

		const reserveOthers: {
			r0: BigNumber
			r1: BigNumber
		}[] = []
		for await (const [r0, r1, _t] of promiseReserveOthers) reserveOthers.push({ r0, r1 })

		let i = 0,
			diff = BigNumber.from(0),
			lastSuccessBigCall: {
				amountIn: BigNumber
				diff: BigNumber
				pair1: Contract
			}
		for (const { r0, r1 } of reserveOthers) {
			let j = -1
			for (const amountPayback of amountsPayback) {
				j++
				if (r1.lt(amountPayback)) continue
				let amountIn = percents[j],
					amountInWithFee = amountIn.mul(997),
					numerator = amountInWithFee.mul(r1),
					denominator = r0.mul(1000).add(amountInWithFee),
					amountOut = numerator.div(denominator),
					gt = amountOut.gt(amountPayback)

				if (gt) {
					COUNTER_SUCCESS++
					let diff2 = amountOut.sub(amountPayback)
					if (diff2.gt(diff)) {
						diff = diff2
						lastSuccessBigCall = {
							amountIn,
							pair1: others[i],
							diff,
						}
					}
				} else COUNTER_FAIL++
			}
			i++
		}
		if (typeof lastSuccessBigCall != 'undefined') {
			LOCK_ON_SYNC = true
			console.log(
				`💲 ${event.blockNumber} call flashswap for ${utils.formatUnits(lastSuccessBigCall.diff, token1.decimals)} ${
					token1.symbol
				}`
			)
			IMMEDIATE_IDS.push(
				setImmediate(() => {
					callFlashswap(event.blockNumber, lastSuccessBigCall.amountIn, pc, lastSuccessBigCall.pair1)
				})
			)
		}
		COUNTER++
	} catch (error) {
		makeError(error, '### onSync ###')
	}
}

const callFlashswap = async (blockNumber: number, _amountIn: BigNumber, pair: Contract, pair2: Contract) => {
	try {
		let routerBorrow = getNameExchange(pair.address),
			routerSell = getNameExchange(pair2.address),
			message = `🔍 ${blockNumber} send transaction between ${routerBorrow}/${routerSell}`
		console.log(message)

		const msg = {
			to: process.env['SENDGRID_TO'], // Change to your recipient
			from: process.env['SENDGRID_FROM'], // Change to your verified sender
			subject: 'Find an opportunity arbitrage',
			text: message,
			html: `<strong>${message} at ${Date.now()}</strong>`,
		}
		await sgMail.send(msg)
		LOCK_ON_SYNC = false
	} catch (error) {
		makeError(error, '### callFlashswap ###')
	}
}

const logs = () => console.log(`💬 ${BLOCKNUMBER}\t${COUNTER_CALL}\t${COUNTER_TIME_REJECT}\t${COUNTER}\t${COUNTER_SUCCESS}\t${COUNTER_FAIL}`)

const FLASHSWAPS: FlashswapV2[] = [],
	INTERVAL_IDS: NodeJS.Timer[] = [],
	IMMEDIATE_IDS: NodeJS.Immediate[] = []
const init = async () => {
	console.log(`🔵 Initialize...`)
	try {
		const tokenA = getToken('WMATIC'),
			tokenB = getToken('WBTC'),
			tokenC = getToken('WETH'),
			tokenD = getToken('USDC')

		const tokens = [tokenA, tokenB, tokenC, tokenD]

		console.log(`🔶 Create instances for ${tokens.length} tokens`)
		let i = 0
		for (const t0 of tokens) {
			let j = -1
			for (const t1 of tokens) {
				j++
				if (i >= j) continue
				let flashswap = new FlashswapV2(t0, t1)
				try {
					console.log(`flashswap[${j}] ${t0.symbol}/${t1.symbol}`)
					await flashswap.initialize()
					FLASHSWAPS.push(flashswap)
				} catch (error) {
					throw error
				}
			}
			i++
		}
		console.log(`Created ${FLASHSWAPS.length} instances\n🔶 Create listeners`)
		i = 0
		for (const flashswap of FLASHSWAPS) {
			i += await flashswap.onSync(onSync)
		}
		console.log(`Created ${i} listeners\nserver listening at :${PORT}`)
		LOCK_ON_SYNC = false
		httpServer.listen(PORT, '0.0.0.0')
		io.attach(httpServer)
		INTERVAL_IDS.push(setInterval(logs, 1e3 * 120))
	} catch (error) {
		makeError(error, '### init ###')
	}
}

const makeError = (error: any, capsule?: string) => {
	LOCK_ON_SYNC = true
	let ln = FLASHSWAPS.length
	for (let index = 0; index < ln; index++) {
		FLASHSWAPS.shift()
	}
	ln = INTERVAL_IDS.length
	for (let index = 0; index < ln; index++) {
		clearInterval(INTERVAL_IDS[0])
		INTERVAL_IDS.shift()
	}
	ln = IMMEDIATE_IDS.length
	for (let index = 0; index < ln; index++) {
		clearImmediate(IMMEDIATE_IDS[0])
		IMMEDIATE_IDS.shift()
	}
	console.error(capsule || '###')
	console.error(error)
	console.error(capsule || '###')

	provider.removeAllListeners()

	console.log(`Restart main`)
	setTimeout(() => {
		main()
	}, 6590)
}

const main = async () => {
	console.log(`🔵 Arbitrage start`)
	try {
		await init()
	} catch (error) {
		makeError(error)
	}
}

let LOCK_CLOSE = false
const close = () => {
	if (LOCK_CLOSE) return
	LOCK_CLOSE = true
	console.log(`\n🔴 purge server`)
	io.close((err) => console.error(err))
	process.exit()
}

process.on('exit', close)
process.on('SIGINT', close)
process.on('SIGTERM', close)

const START_AT = Date.now()

const httpServer = createServer(),
	io = new Server(),
	PORT = 3001

io.on('connection', (socket) => {
	console.log(`new client ${socket.id}`)
	socket.on('disconnect', () => {
		console.log(`${socket.id} disconnected`)
	})

	INTERVAL_IDS.push(
		setInterval(() => {
			let logs: ServerLogs = {
				START_AT,
				UPTIME: Date.now(),
				BLOCKNUMBER,
				COUNTER_CALL,
				COUNTER_TIME_REJECT,
				COUNTER,
				COUNTER_SUCCESS,
				COUNTER_FAIL,
			}
			socket.emit('logs', logs)
		}, 30000)
	)
})

main()
