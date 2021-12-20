import { BigNumber, Contract, Event, utils } from 'ethers'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import fr from 'dayjs/locale/fr'
import Flashswap from './flashswap'
import { clearAllAsyncInterval, getToken, raoContract, signer } from './utils'
import { onSyncInfos, Token } from './types'
import { TransactionResponse } from '@ethersproject/abstract-provider'

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
		if (LOCK_ON_SYNC || event.blockNumber == BLOCKNUMBER) return
		BLOCKNUMBER = event.blockNumber // also lockable

		const { pair: pc, pairs: others, token0, token1 } = infos

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
					let diff2 = amountOut.sub(amountPayback)
					if (diff2.gt(diff)) {
						diff = diff2
						lastSuccessBigCall = {
							amountIn,
							pair1: others[i],
							diff,
						}
					}
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
				} else COUNTER_FAIL++
			}
			table.push({})
			i++
		}
		if (typeof lastSuccessBigCall != 'undefined') {
			LOCK_ON_SYNC = true
			console.log(`flashswap ${utils.formatUnits(lastSuccessBigCall.diff, token1.decimals)} ${token1.symbol}`)
			console.log(`Borrow : ${Flashswap.getNameExchange(pc.address)}`)
			console.table(table)
			setTimeout(() => {
				callFlashswap(lastSuccessBigCall.amountIn, pc, lastSuccessBigCall.pair1)
			}, 0)
		}
		COUNTER++
	} catch (error) {
		throw error
	}
}

const callFlashswap = async (amountIn: BigNumber, pair: Contract, pair2: Contract) => {
	try {
		let router = Flashswap.getRouterContractFromPairAddress(pair2.address)
		if (typeof router === 'undefined') {
		}

		let flash = utils.defaultAbiCoder.encode(
				['FlashData(uint256 amountBorrow, address pairBorrow, address routerSell)'],
				[{ amountBorrow: amountIn, pairBorrow: pair.address, routerSell: router.address }]
			),
			deadline = Math.floor(Date.now() / 1000) + 30,
			tx: TransactionResponse = await raoContract.connect(signer).callStatic.flashswap(flash, deadline, {
				gasLimit: utils.parseUnits('2', 'mwei'),
				gasPrice: utils.parseUnits('380', 'gwei'),
			}),
			receipt = await tx.wait(2)
		LOCK_ON_SYNC = false
		console.log(receipt)
		process.kill(process.pid, 'SIGTERM')
	} catch (error) {
		console.log(error)
		process.kill(process.pid, 'SIGTERM')
	}
}

const pid = process.pid,
	date_launched = dayjs()
const logs = () => {
	let now = dayjs()
	console.table({
		PID: pid,
		'Started at': date_launched.format('D/M/YYYY H:m:s'),
		'Live date': now.format('D/M/YYYY H:m:s'),
		Running: now.diff(date_launched, 'second'),
		COUNTER,
		COUNTER_CALL,
		COUNTER_SUCCESS,
		COUNTER_FAIL,
	})
}

const app = async () => {
	console.log(`App start ${date_launched.format('D/M/YYYY H:m:s')}`)
	try {
		setInterval(logs, 1e3 * 45)
		const tokenA = getToken('WMATIC'),
			tokenB = getToken('WBTC'),
			tokenC = getToken('WETH'),
			tokenD = getToken('USDC')

		const tokens = [tokenA, tokenB, tokenC, tokenD]

		console.log(`Create instances for ${tokens.length} tokens`)
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
					console.log(`error instanciated ${t0.symbol}/${t1.symbol}`)
					throw error
				}
			}
			i++
		}
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
process.on('SIGTERM', close)
