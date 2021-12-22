import { config } from 'dotenv'
import { providers, Contract, constants, Wallet, BigNumber, utils } from 'ethers'
import { abi as FACTORY_ABI } from './abi/IUniswapV2Factory.json'
import { abi as ROUTER_ABI } from './abi/IUniswapV2Router01.json'
import { abi as PAIR_ABI } from './abi/IUniswapV2Pair.json'
import { abi as TOKEN_ABI } from './abi/IERC20.json'
import { abi as RAO_ABI } from './abi/RaoArbitrage.json'
import TOKENS from './tokens.json'
import { Token, Address, Exchanges } from './types'

/* CONFIGURATION */
config()
export const isDevelopment = process.env['NODE_ENV'] == 'dev'

export const THROW_NOT_FOUND_PAIR = 'THROW_NOT_FOUND_PAIR',
	THROW_NOT_FOUND_TOKEN = 'THROW_NOT_FOUND_TOKEN'

export const NETWORK = 137
const INFURA_IDS = process.env['INFURA_IDS'].split(','),
	INFURA_SECRETS = process.env['INFURA_SECRETS'].split(',')
let INFURA_INDEX = 0
export let provider: providers.Provider = isDevelopment
	? new providers.JsonRpcProvider('http://localhost:8545', NETWORK)
	: new providers.InfuraProvider(NETWORK, {
			projectId: INFURA_IDS[INFURA_INDEX],
			projectSecret: INFURA_SECRETS[INFURA_INDEX],
	  })
export let signer = new Wallet(isDevelopment ? process.env['GANACHE_PRIVATE_KEY'] : process.env['PRIVATE_KEY'], provider),
	factoryContract = new Contract(constants.AddressZero, FACTORY_ABI, provider),
	routerContract = new Contract(constants.AddressZero, ROUTER_ABI, provider),
	pairContract = new Contract(constants.AddressZero, PAIR_ABI, provider),
	tokenContract = new Contract(constants.AddressZero, TOKEN_ABI, provider),
	raoContract = new Contract('0x4c2fC697B1C0d571E04C6F2750c672BE0CB66407', RAO_ABI, provider)

export const switchInfuraProvider = () => {
	provider.removeAllListeners()
	INFURA_INDEX = (INFURA_INDEX + 1) % INFURA_SECRETS.length
	let apiKey = {
		projectId: INFURA_IDS[INFURA_INDEX],
		projectSecret: INFURA_SECRETS[INFURA_INDEX],
	}
	provider = new providers.InfuraProvider(NETWORK, apiKey)

	signer = signer.connect(provider)
	factoryContract = factoryContract.connect(provider)
	routerContract = routerContract.connect(provider)
	pairContract = pairContract.connect(provider)
	tokenContract = tokenContract.connect(provider)
	raoContract = raoContract.connect(provider)

	for (const i of EXCHANGE_INFOS) {
		FACTORIES.shift()
		ROUTERS.shift()
		let ln = i.pairs.length
		for (let index = 0; index < ln; index++) {
			i.pairs.pop()
		}
		FACTORIES.push(factoryContract.attach(i.factory))
		ROUTERS.push(routerContract.attach(i.router))
	}
}

export const getToken = (symbol: string): Token => {
	let token = TOKENS.find((t) => t.symbol == symbol)
	if (typeof token === 'undefined') throw new Error(THROW_NOT_FOUND_TOKEN)
	return token
}

export const eqAddress = (address0: Address, address1: Address) =>
	utils.isAddress(address0) && utils.isAddress(address1) && BigNumber.from(address0).eq(BigNumber.from(address1))

export const required = (condition: boolean, message?: string) => {
	if (!condition) throw new Error(message || 'Required: Une erreur est survenue !')
}

export const EXCHANGE_INFOS: Exchanges[] = [
	{
		name: 'Sushiswap',
		factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
		router: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
		pairs: [],
	},
	{
		name: 'Quickswap',
		factory: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
		router: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
		pairs: [],
	},
	{
		name: 'Apeswap',
		factory: '0xCf083Be4164828f00cAE704EC15a36D711491284',
		router: '0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607',
		pairs: [],
	},
	{
		name: 'Jetswap',
		factory: '0x668ad0ed2622C62E24f0d5ab6B6Ac1b9D2cD4AC7',
		router: '0x5C6EC38fb0e2609672BDf628B1fD605A523E5923',
		pairs: [],
	},
]

export const FACTORIES = EXCHANGE_INFOS.map((i) => factoryContract.attach(i.factory)),
	ROUTERS = EXCHANGE_INFOS.map((i) => routerContract.attach(i.router))

/* const asyncIntervals: boolean[] = []

const runAsyncInterval = async (cb: CallableFunction, interval: number, intervalIndex: number) => {
	await cb()
	if (asyncIntervals[intervalIndex]) {
		setTimeout(() => runAsyncInterval(cb, interval, intervalIndex), interval)
	}
}

export const setAsyncInterval = (cb: CallableFunction, interval: number) => {
	if (cb && typeof cb === 'function') {
		const intervalIndex = asyncIntervals.length
		asyncIntervals.push(true)
		runAsyncInterval(cb, interval, intervalIndex)
		return intervalIndex
	} else {
		throw new Error('Callback must be a function')
	}
}

export const clearAsyncInterval = (intervalIndex: number) => {
	if (asyncIntervals[intervalIndex]) {
		asyncIntervals[intervalIndex] = false
	}
}
export const clearAllAsyncInterval = () => {
	for (let ai of asyncIntervals) {
		ai = false
	}
} */

export const getNameExchange = (address: Address) => {
	for (const ex of EXCHANGE_INFOS) {
		if (
			eqAddress(ex.factory, address) ||
			eqAddress(ex.router, address) ||
			typeof ex.pairs.find((p) => eqAddress(p, address)) != 'undefined'
		)
			return ex.name
	}
}

export const getRouterContractFromPairAddress = (pairAddress: Address) => {
	let i = 0
	for (const ex of EXCHANGE_INFOS) {
		if (typeof ex.pairs.find((p) => eqAddress(p, pairAddress)) != 'undefined') return ROUTERS[i]
		i++
	}
}

process.on('exit', () => {
	provider.removeAllListeners()
})
