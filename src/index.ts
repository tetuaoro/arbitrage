import { config } from 'dotenv'
import { providers, Contract, constants, BigNumber, Wallet, utils } from 'ethers'
import { Event } from '@ethersproject/contracts'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { getToken } from './utils'
import { abi as FACTORY_ABI } from './abi/IUniswapV2Factory.json'
import { abi as ROUTER_ABI } from './abi/IUniswapV2Router01.json'
import { abi as PAIR_ABI } from './abi/IUniswapV2Pair.json'
import { abi as TOKEN_ABI } from './abi/IERC20.json'
import { abi } from './abi/RaoArbitrage.json'

/* CONFIGURATION */
config()
const dev = process.env['NODE_ENV'] == 'dev'
const PK = dev ? process.env['GANACHE_PRIVATE_KEY'] : process.env['PRIVATE_KEY']

const THROW_NOT_FOUND_PAIR = 'THROW_NOT_FOUND_PAIR'

const NETWORK = 137,
	provider = dev
		? new providers.JsonRpcProvider('http://localhost:8545', NETWORK)
		: new providers.InfuraProvider(NETWORK, {
				projectId: process.env['INFURA_ID'],
				projectSecret: process.env['INFURA_SECRET'],
		  })
const signer = new Wallet(PK, provider),
	factoryContract = new Contract(constants.AddressZero, FACTORY_ABI, provider),
	routerContract = new Contract(constants.AddressZero, ROUTER_ABI, provider),
	pairContract = new Contract(constants.AddressZero, PAIR_ABI, provider),
	tokenContract = new Contract(constants.AddressZero, TOKEN_ABI, provider),
	RAO_ARBITRAGE = new Contract('0x7d35cd1250b8167a027669Ee5ccC90e23D31d16D', abi, provider)

/* START */
var SUSHI_FACTORY: Contract,
	QUICK_FACTORY: Contract,
	SUSHI_ROUTER: Contract,
	QUICK_ROUTER: Contract,
	SUSHI_PAIR: Contract,
	QUICK_PAIR: Contract,
	tc0: Contract,
	tc1: Contract,
	TOKEN0: TOKEN,
	TOKEN1: TOKEN,
	MATIC: TOKEN
const initalize = async () => {
	console.log(`Initialize...`)
	try {
		MATIC = getToken('WMATIC')
		TOKEN0 = getToken('WBTC')
		TOKEN1 = getToken('WETH')

		SUSHI_FACTORY = factoryContract.attach('0xc35DADB65012eC5796536bD9864eD8773aBc74C4') // sushi
		QUICK_FACTORY = factoryContract.attach('0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32') // quick

		SUSHI_ROUTER = routerContract.attach('0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506') // sushi
		QUICK_ROUTER = routerContract.attach('0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff') // quick

		var pair: string
		pair = await SUSHI_FACTORY.getPair(TOKEN0.address, TOKEN1.address)
		if (BigNumber.from(pair).eq(BigNumber.from(constants.AddressZero))) throw new Error(THROW_NOT_FOUND_PAIR + ' FACTORY 1')
		SUSHI_PAIR = pairContract.attach(pair)
		var token0: string = await SUSHI_PAIR.token0()
		if (!BigNumber.from(token0).eq(BigNumber.from(TOKEN0.address))) {
			const temp = TOKEN0
			TOKEN0 = TOKEN1
			TOKEN1 = temp
		}
		pair = await QUICK_FACTORY.getPair(TOKEN0.address, TOKEN1.address)
		if (BigNumber.from(pair).eq(BigNumber.from(constants.AddressZero))) throw new Error(THROW_NOT_FOUND_PAIR + ' FACTORY 2')
		QUICK_PAIR = pairContract.attach(pair)

		tc0 = tokenContract.attach(TOKEN0.address)
		tc1 = tokenContract.attach(TOKEN1.address)
	} catch (error) {
		throw error
	}
}

const swap = async () => {
	console.log(`Swap...`)
	try {
		const amountIn = utils.parseEther('3000'),
			amountOutMin = utils.parseUnits('0.00001', TOKEN0.decimals),
			deadline = Math.floor(Date.now() / 1000) + 30
		const tx: TransactionResponse = await QUICK_ROUTER.connect(signer).swapExactETHForTokens(
			amountOutMin,
			[MATIC.address, TOKEN0.address],
			signer.address,
			deadline,
			{
				gasPrice: utils.parseUnits('20', 'gwei'),
				gasLimit: utils.parseUnits('12', 'mwei'),
				value: amountIn,
			}
		)
		await tx.wait()
	} catch (error) {
		throw error
	}
}

var COUNTER_ERROR = 0,
	COUNTER_SUCCESS = 0,
	COUNTER_FAIL = 0,
	COUNTER = 0
const monitoring = async (pair: Address, reserve0: BigNumber, reserve1: BigNumber, event: Event) => {
	try {
		var CONTRACT_PAIR: Contract, NAME_PAIR_BORROW: string, NAME_PAIR_SELL: string
		if (pair == SUSHI_PAIR.address) {
			CONTRACT_PAIR = SUSHI_PAIR
			NAME_PAIR_BORROW = 'SUSHI_BORROW_IN'
			NAME_PAIR_SELL = 'QUICK_SELL_OUT'
		} else {
			CONTRACT_PAIR = QUICK_PAIR
			NAME_PAIR_BORROW = 'QUICK_BORROW_IN'
			NAME_PAIR_SELL = 'SUSHI_SELL_OUT'
		}
		// borrow on listener pair
		const onePercent = reserve0.div(100),
			twoPercent = reserve0.div(50),
			fivePercent = reserve0.div(20),
			tenPercent = reserve0.div(10),
			twentyPercent = reserve0.div(5),
			fiftyPercent = reserve0.div(2),
			percents = [onePercent, twoPercent, fivePercent, tenPercent, twentyPercent, fiftyPercent],
			reserveOther: [BigNumber, BigNumber, number] = await CONTRACT_PAIR.getReserves(),
			reserveIn = reserveOther[0],
			reserveOut = reserveOther[1],
			table = []
		for (const amountIn of percents) {
			let amountInWithFee = amountIn.mul(997),
				numerator = amountInWithFee.mul(reserveOut),
				denominator = reserveIn.mul(1000).add(amountInWithFee),
				// amountOut from other pair for amount borrowed
				amountOut = numerator.div(denominator),
				amountToRepay = reserve1.mul(1000).mul(amountIn).div(reserve0.mul(997)).add(1),
				gt = amountOut.gt(amountToRepay),
				s1 = gt ? amountOut.sub(amountToRepay).mul(2) : amountToRepay.sub(amountOut).mul(2),
				s2 = s1.div(amountOut.add(amountToRepay)).mul(1e5)
			table.push({
				NAME_PAIR_BORROW: utils.formatUnits(amountIn, TOKEN0.decimals),
				NAME_PAIR_SELL: utils.formatUnits(amountOut, TOKEN1.decimals),
				Repay: utils.formatUnits(amountToRepay, TOKEN1.decimals),
				'CallSwap?': gt,
				difference: s2.toString(),
			})

			if (gt) COUNTER_SUCCESS++
			else COUNTER_FAIL++
		}
		COUNTER++
		console.log(`${NAME_PAIR_BORROW} -> ${NAME_PAIR_SELL} ///${COUNTER}`)
	} catch (error) {
		throw error
	}
}

const listener = async () => {
	console.log(`Listening...`)
	try {
		SUSHI_PAIR.on('Sync', async (reserve0: BigNumber, reserve1: BigNumber, event: Event) => {
			try {
				await monitoring(SUSHI_PAIR.address, reserve0, reserve1, event)
			} catch (error) {
				COUNTER_ERROR++
			}
		})
		QUICK_PAIR.on('Sync', async (reserve0: BigNumber, reserve1: BigNumber, event: Event) => {
			try {
				await monitoring(QUICK_PAIR.address, reserve0, reserve1, event)
			} catch (error) {
				COUNTER_ERROR++
			}
		})
	} catch (error) {
		throw error
	}
}

;(async () => {
	try {
		setInterval(() => {
			console.log(`logs ///${COUNTER}`)
			console.table([
				{
					COUNTER_ERROR,
					COUNTER_FAIL,
					COUNTER_SUCCESS,
				},
			])
		}, 1e3 * 60)
		await initalize()
		await listener()
	} catch (error) {
		console.log('####')
		console.error(error)
		console.log('####')
	}
})()

const close = () => {
	console.table([
		{
			COUNTER_ERROR,
			COUNTER_FAIL,
			COUNTER_SUCCESS,
		},
	])
	provider.removeAllListeners()
	console.log(`Clear listener...\nDone.`)
}

process.on('exit', close)
process.on('SIGINT', close)
