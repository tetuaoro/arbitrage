import { BigNumber, Contract, Event, utils } from 'ethers'
import Flashswap from './flashswap'
import { MESSAGE_SUCCESS_TRANSACTION } from './constants'
import { getToken, switchInfuraProvider, raoContract, signer, getRouterContractFromPairAddress, getNameExchange } from './utils'
import { onSyncInfos, ServerOnSync } from './types'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Logger } from 'ethers/lib/utils'

import express from 'express'
import { Server, Socket } from 'socket.io'
import { createServer } from 'https'
import { readFileSync } from 'fs'

let BLOCKNUMBER = 0,
	COUNTER_SUCCESS = 0,
	COUNTER_CALL = 0,
	COUNTER_FAIL = 0,
	COUNTER = 0,
	LOCK_ON_SYNC = true
const onSync = async (infos: onSyncInfos, _r0: any, _r1: any, event: Event) => {
	try {
		COUNTER_CALL++
		if (LOCK_ON_SYNC || event.blockNumber <= BLOCKNUMBER) return
		BLOCKNUMBER = event.blockNumber // also lockable

		const { pair: pc, pairs: others, token0, token1 } = infos

		const [reserve0, reserve1, ts]: [BigNumber, BigNumber, number] = await pc.getReserves()

		if (Date.now() / 1000 - ts > 5) return

		const onePercent = reserve0.div(100),
			twoPercent = reserve0.div(50),
			fivePercent = reserve0.div(20),
			tenPercent = reserve0.div(10),
			twentyPercent = reserve0.div(5),
			fiftyPercent = reserve0.div(2),
			percentsToNumber = [1, 2, 5, 10, 20, 50],
			percents = [onePercent, twoPercent, fivePercent, tenPercent, twentyPercent, fiftyPercent]

		const amountsPayback: BigNumber[] = []
		for (const amountInPercent of percents) amountsPayback.push(reserve1.mul(1000).mul(amountInPercent).div(reserve0.mul(997)).add(1))

		const promiseReserveOthers: Promise<[BigNumber, BigNumber, number]>[] = []
		for (const pair of others) promiseReserveOthers.push(pair.getReserves())

		const reserveOthers: {
			r0: BigNumber
			r1: BigNumber
		}[] = []
		for await (const reserves of promiseReserveOthers) reserveOthers.push({ r0: reserves[0], r1: reserves[1] })

		const table: ServerOnSync[] = []
		let i = 0,
			diff: BigNumber = BigNumber.from('0'),
			lastSuccessBigCall: {
				amountIn: BigNumber
				diff: BigNumber
				pair1: Contract
			}
		for (const reserve of reserveOthers) {
			let j = -1
			for (const amountPayback of amountsPayback) {
				j++
				if (reserve.r1.lt(amountPayback)) continue
				let amountIn = percents[j],
					amountInWithFee = amountIn.mul(997),
					numerator = amountInWithFee.mul(reserve.r1),
					denominator = reserve.r0.mul(1000).add(amountInWithFee),
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
					table.push({
						'#': `${percentsToNumber[j]}%`,
						[`${token0.symbol}_BORROW`]: utils.formatUnits(amountIn, token0.decimals),
						BLOCKNUMBER,
						Sell: getNameExchange(others[i].address),
						[token1.symbol]: utils.formatUnits(amountOut, token1.decimals),
						[`${token1.symbol}_PAYBACK`]: utils.formatUnits(amountPayback, token1.decimals),
						'Call?': gt,
					})
				} else COUNTER_FAIL++
			}
			table.push({})
			i++
		}
		if (typeof lastSuccessBigCall != 'undefined') {
			LOCK_ON_SYNC = true
			console.log(`💲 call flashswap for ${utils.formatUnits(lastSuccessBigCall.diff, token1.decimals)} ${token1.symbol}`)
			IMMEDIATE_IDS.push(
				setImmediate(() => {
					callFlashswap(lastSuccessBigCall.amountIn, pc, lastSuccessBigCall.pair1)
				})
			)
		}
		COUNTER++
	} catch (error) {
		makeError(error, '### onSync ###')
	}
}

const callFlashswap = async (amountIn: BigNumber, pair: Contract, pair2: Contract) => {
	try {
		let router = getRouterContractFromPairAddress(pair2.address)
		if (typeof router === 'undefined') {
		}

		let flash = utils.defaultAbiCoder.encode(
				['FlashData(uint256 amountBorrow, address pairBorrow, address routerSell)'],
				[{ amountBorrow: amountIn, pairBorrow: pair.address, routerSell: router.address }]
			),
			deadline = Math.floor(Date.now() / 1000) + 30,
			tx: TransactionResponse = await raoContract.connect(signer).callStatic.flashswap(flash, deadline, {
				gasLimit: utils.parseUnits('2', 'mwei'), // 2.6315
				gasPrice: utils.parseUnits('380', 'gwei'),
			})
		await tx.wait(2)
		LOCK_ON_SYNC = false
		console.log(`😀 ${MESSAGE_SUCCESS_TRANSACTION}`)
	} catch (error) {
		makeError(error)
	}
}

// const dayjsFormat = (seconds: number) => {
// 	let hour = Math.floor(seconds / 60 ** 2),
// 		minute = Math.floor(seconds / 60) % 60,
// 		second = seconds % 60

// 	return `${hour}:${minute}:${second}`
// }

// const getDate = () => {
// 	return dayjs().format('D/M/YYYY H:m:s')
// }
// const date_launched = dayjs()
const logs = () => {
	// let now = dayjs()
	// const data: ServerData = {
	// 	StartedAt: date_launched.format('D/M/YYYY H:m:s'),
	// 	LiveDate: now.format('D/M/YYYY H:m:s'),
	// 	Running: dayjsFormat(now.diff(date_launched, 'seconds')),
	// 	COUNTER,
	// 	COUNTER_CALL,
	// 	COUNTER_SUCCESS,
	// 	COUNTER_FAIL,
	// }

	console.log(`💬 ${COUNTER_CALL}/${COUNTER}/${COUNTER_SUCCESS}/${COUNTER_FAIL}`)
}

const FLASHSWAPS: Flashswap[] = [],
	INTERVAL_IDS: NodeJS.Timer[] = [],
	IMMEDIATE_IDS: NodeJS.Immediate[] = []
const app = async () => {
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
				let flashswap = new Flashswap(t0, t1)
				try {
					console.log(`flashswap[${j}] ${t0.symbol}/${t1.symbol}`)
					await flashswap.initialize()
					FLASHSWAPS.push(flashswap)
				} catch (error) {
					console.log(`error instanciated ${t0.symbol}/${t1.symbol}`)
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
		console.log(`Created ${i} listeners`)
		LOCK_ON_SYNC = false
		INTERVAL_IDS.push(setInterval(logs, 1e3 * 120))
	} catch (error) {
		makeError(error, '### app ###')
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

	if (error && error.code && error.code == Logger.errors.TIMEOUT) {
		// change provider
		switchInfuraProvider()
		console.log(`Restart main`)
		main()
	} else {
		console.log(`😭 Force exit`)
		process.exit()
	}
}

const main = async () => {
	console.log(`🔵 Arbitrage start`)
	try {
		await app()
	} catch (error) {
		makeError(error)
	}
}

let LOCK_CLOSE = false
const close = () => {
	if (LOCK_CLOSE) return
	LOCK_CLOSE = true
	console.log(`\n🔴 purge server`)
	process.exit()
}

const appExpress = express()
const appServer = createServer({
	key: readFileSync('certificat/server.key'),
	cert: readFileSync('certificat/server.cert'),
}, appExpress)
const server = appServer.listen(3001)

appExpress.use(express.static('public'))

const io = new Server(server, {
	cors: {
		origin: 'https://ionos.rao-nagos.pf',
		methods: ['GET', 'POST'],
	},
})

console.log(process.env['PORT'], process.env['IP'])

io.on('listening', () => {
	console.log(`server listen at :3001`)
})

io.on('connection', (socket: Socket) => {
	console.log(`new user /${socket.id}`)

	socket.on('disconnect', () => {
		console.log(`${socket.id} disconnected`)
	})
})

process.on('exit', close)
process.on('SIGINT', close)
process.on('SIGTERM', close)

main()
