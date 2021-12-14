import { config } from 'dotenv'
import { providers, Contract, constants, BigNumber, Wallet, utils } from 'ethers'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { getToken } from './utils'
import { abi as FACTORY_ABI } from './abi/IUniswapV2Factory.json'
import { abi as ROUTER_ABI } from './abi/IUniswapV2Router01.json'
import { abi as PAIR_ABI } from './abi/IUniswapV2Pair.json'
import { abi as TOKEN_ABI } from './abi/IERC20.json'
import { abi } from './abi/RaoArbitrage.json'

config()

const THROW_NOT_FOUND_PAIR = 'THROW_NOT_FOUND_PAIR'

const provider = new providers.JsonRpcProvider('http://localhost:8545', 137),
	signer = new Wallet(process.env['GANACHE_PRIVATE_KEY'], provider),
	factoryContract = new Contract(constants.AddressZero, FACTORY_ABI, provider),
	routerContract = new Contract(constants.AddressZero, ROUTER_ABI, provider),
	pairContract = new Contract(constants.AddressZero, PAIR_ABI, provider),
	tokenContract = new Contract(constants.AddressZero, TOKEN_ABI, provider),
	RAO_ARBITRAGE = new Contract('0xf3573E68D01849Fb33FD3c880F703503E946da93', abi, provider)

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

const app = async () => {
	console.log(`App...`)
	try {
		const balanceOf = await tc0.balanceOf(signer.address)
		console.log(`balanceOf ${TOKEN0.symbol} ${utils.formatUnits(balanceOf, TOKEN0.decimals)}`)

		const path = [TOKEN0.address, TOKEN1.address]
		const sushi_amounts: [BigNumber, BigNumber] = await SUSHI_ROUTER.getAmountsOut(balanceOf, path),
			quick_amounts: [BigNumber, BigNumber] = await QUICK_ROUTER.getAmountsOut(balanceOf, path)

		var routerExpensive: Address, routerCheap: Address
		if (sushi_amounts[1].gt(quick_amounts[1])) {
			routerCheap = SUSHI_ROUTER.address
			routerExpensive = QUICK_ROUTER.address
		} else {
			routerCheap = QUICK_ROUTER.address
			routerExpensive = SUSHI_ROUTER.address
		}

		const deadline = Math.floor(Date.now() / 1000) + 30
		const res: BigNumber = await RAO_ARBITRAGE.swap(TOKEN0.address, TOKEN1.address, routerExpensive, routerCheap, balanceOf, deadline)
		console.log(`rao says ${utils.formatUnits(res, TOKEN0.decimals)}`)
		console.table([
			{
				sushiOut: utils.formatUnits(sushi_amounts[1], TOKEN1.decimals),
				quickOut: utils.formatUnits(quick_amounts[1], TOKEN1.decimals),
			},
		])
	} catch (error) {
		throw error
	}
}

;(async () => {
	try {
		await initalize()
		await swap()
		await app()
	} catch (error) {
		console.error(error)
	}
})()
