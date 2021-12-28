import { BigNumber } from 'ethers'
import { Address, Reserves, Result } from './types'
import { queryContract, moralis, FACTORY_ADDRESSES, ROUTER_ADDRESSES, sliceArray, getAmountOut, getAmountOutToPayback } from './utils'

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

const getBestOpportunity = async (reserves: Array<Array<Reserves>>) => {
	console.log(`🔨 call getBestOpportunity`)
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
						borrow0 = r0A.gt(r1A)

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
							if (change)
								_results.push({
									exchangesIndexs: rewardsA.gt(rewardsB) ? [a, b] : [b, a],
									reserveIndex: i,
									rewards: rewardsA.gt(rewardsB) ? rewardsA : rewardsB,
									percent,
								})
						}
					}
				}
			}

			if (_results.length > 0) {
				_results.sort((a, b) => (a.rewards.gt(b.rewards) ? 1 : -1))
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
	AVERAGE_GBO_COMPUTE_TIME_NUMERATOR = 0,
	AVERAGE_GBO_DENOMINATOR = 0
const listenBlock = async () => {
	console.log(`🔶 listenBlock start`)
	try {
		moralis.on('block', async (blockNumber: number) => {
			try {
				COUNTER_ON_BLOCK++
				if (BLOCKNUMBER >= blockNumber) return
				BLOCKNUMBER = blockNumber
				const RESERVES: Array<Array<Reserves>> = []
				const reservesByPairs: Array<Reserves> = await queryContract.getReservesByPairs(PAIR_ADDRESSES)

				const t0 = Date.now()
				RESERVES.push(...sliceArray(FACTORY_ADDRESSES.length, reservesByPairs))
				const results = await getBestOpportunity(RESERVES)

				if (results.length > 0) {
					const _PAIR_ADDRESSES = sliceArray(FACTORY_ADDRESSES.length, PAIR_ADDRESSES)
					for (let i = 0; i < results.length; i++) {
						const element = results[i],
							pairA = _PAIR_ADDRESSES[element.exchangesIndexs[0]][element.reserveIndex]

						IMMEDIATES.push(
							setImmediate(async () => {
								await flashswap(
									pairA,
									ROUTER_ADDRESSES[element.exchangesIndexs[1]],
									element.percent,
									blockNumber
								)
							})
						)
					}
				}

				AVERAGE_GBO_DENOMINATOR++
				AVERAGE_GBO_COMPUTE_TIME_NUMERATOR += Date.now() - t0
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

const flashswap = async (pair: Address, router: Address, percent: number, blocknumber: number) => {
	console.log(`❕❕ flashswap start`)
	try {
		console.log(`💱 ${blocknumber}\t${pair}/${router}\t${100 / percent}%`)
	} catch (_error) {
		const error = { _error, target: flashswap.name }
		makeError(error)
	}
}

const makeError = (error: any) => {
	if (error && error.target && error.error) {
		console.log(`❌ ${error.target}`)
		console.error(error.error)
		console.log(`❌ ${error.target}`)
	} else {
		console.error(error)
	}
}

let COUNTER_STARTED = 0
const app = async () => {
	console.log(`🔵 App start`)
	try {
		COUNTER_STARTED++
		if (COUNTER_STARTED == 1) await getPairsByFactory() // once
		await listenBlock()

		INTERVALS.push(setInterval(() => {
			console.log(
				`💬 ${COUNTER_STARTED}\t${BLOCKNUMBER}\T${COUNTER_ON_BLOCK}\t${
					AVERAGE_GBO_COMPUTE_TIME_NUMERATOR / AVERAGE_GBO_DENOMINATOR
				}`
			)
		}, 10e3 * 37))
	} catch (_error) {
		const error = { _error, target: app.name }
		makeError(error)
	}
}

app()

const IMMEDIATES: NodeJS.Immediate[] = [],
	INTERVALS: NodeJS.Timer[] = []

process.on('exit', () => {
	console.log(`🔴 purge server`)
	let ln = IMMEDIATES.length
	for (let index = 0; index < ln; index++) {
		IMMEDIATES.pop()
	}
	ln = INTERVALS.length
	for (let index = 0; index < ln; index++) {
		INTERVALS.pop()
	}
})
