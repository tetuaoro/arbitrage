import { BigNumber, Event, utils } from 'ethers'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import fr from 'dayjs/locale/fr'
import Flashswap from './flashswap'
import { clearAllAsyncInterval, getToken } from './utils'
import { onSyncInfos } from './types'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale(fr)
dayjs.tz.setDefault('Pacific/Tahiti')

const FLASHSWAPS: Flashswap[] = []

let BLOCKNUMBER = 0,
	COUNTER_SUCCESS = 0,
	COUNTER_CALL = 0,
	COUNTER_FAIL = 0,
	COUNTER = 0,
	LOCK_ON_SYNC = true
const onSync = async (infos: onSyncInfos, reserve0: BigNumber, reserve1: BigNumber, event: Event) => {
	try {
		COUNTER_CALL++
		if (LOCK_ON_SYNC) return
		if (event.blockNumber == BLOCKNUMBER) return
		BLOCKNUMBER = event.blockNumber // also lockable

		const { pair: pc, pairs: others, token0, token1, flashswap } = infos

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

		const table = []
		let showTable = false,
			i = 0
		for (const reserve of reserveOthers) {
			let j = 0,
				lastSuccessCall: BigNumber
			for (const amountPayback of amountsPayback) {
				let amountIn = percents[j],
					amountInWithFee = amountIn.mul(997),
					numerator = amountInWithFee.mul(reserve.r1),
					denominator = reserve.r0.mul(1000).add(amountInWithFee),
					amountOut = numerator.div(denominator),
					gt = amountOut.gt(amountPayback)

				if (gt) {
					lastSuccessCall = amountIn
					COUNTER_SUCCESS++
					table.push({
						'#': `${percentsToNumber[j]}%`,
						[`${token0.symbol}_BORROW`]: utils.formatUnits(amountIn, token0.decimals),
						BLOCKNUMBER,
						Sell: Flashswap.getNameExchange(others[i].address),
						[token1.symbol]: utils.formatUnits(amountOut, token1.decimals),
						[`${token1.symbol}_PAYBACK`]: utils.formatUnits(amountPayback, token1.decimals),
						'Call?': gt,
					})
					showTable = true
				} else COUNTER_FAIL++
				j++
			}
			if (typeof lastSuccessCall != 'undefined') {
				LOCK_ON_SYNC = true
				flashswap.callFlashswap(lastSuccessCall, pc, others[i], LOCK_ON_SYNC)
			}
			table.push({})
			i++
		}
		if (showTable) {
			console.log(`Borrow : ${Flashswap.getNameExchange(pc.address)}`)
			console.table(table)
		}
		COUNTER++
	} catch (error) {
		throw error
	}
}

const logs = () => {
	console.table({ PID: process.pid, Date: dayjs().format('D/M/YYYY H:m:s'), COUNTER, COUNTER_CALL, COUNTER_SUCCESS, COUNTER_FAIL })
}

const app = async () => {
	console.log(`App start ${dayjs().format('D/M/YYYY H:m:s')}`)
	try {
		setInterval(logs, 1e3 * 45)
		const tokenA = getToken('WMATIC'),
			tokenB = getToken('WBTC'),
			tokenC = getToken('WETH'),
			tokenE = getToken('USDC')

		const tokens = [tokenA, tokenB, tokenC, tokenE]

		console.log(`Create instances`)
		let i = 0
		for (const t0 of tokens) {
			let j = -1
			for (const t1 of tokens) {
				j++
				if (i >= j) continue
				let flashswap = new Flashswap(t0, t1)
				try {
					console.log(`\tflashswap[${j}] ${t0.symbol}/${t1.symbol}`)
					await flashswap.initialize()
					FLASHSWAPS.push(flashswap)
				} catch (error) {
					console.log(`error instanciate at ${i}-${j}`)
					throw error
				}
			}
			i++
		}
		console.log(`--> Created`)
		console.log(`Create listeners`)
		i = 0
		for (const flashswap of FLASHSWAPS) {
			i += await flashswap.onSync(onSync)
		}
		console.log(`--> Created ${i} listeners`)
		LOCK_ON_SYNC = false
	} catch (error) {
		throw error
	}
}

;(async () => {
	console.log(`Arbitrage start`)
	try {
		await app()
	} catch (error) {
		console.error('###')
		console.error(error)
		console.error('###')
	}
})()

let LOCK_CLOSE = false
const close = () => {
	if (LOCK_CLOSE) return
	LOCK_CLOSE = true
	console.log(`\nexit///`)
	logs()
	clearAllAsyncInterval()
	Flashswap.removeAllListeners()
	process.exit()
}

process.on('exit', close)
process.on('SIGINT', close)
