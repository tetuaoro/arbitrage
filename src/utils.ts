import { config } from 'dotenv'
import { providers, Contract, constants, Wallet, BigNumber, utils } from 'ethers'
import { abi as FACTORY_ABI } from './abi/IUniswapV2Factory.json'
import { abi as ROUTER_ABI } from './abi/IUniswapV2Router01.json'
import { abi as PAIR_ABI } from './abi/IUniswapV2Pair.json'
import { abi as TOKEN_ABI } from './abi/IERC20.json'
import { abi as RAO_ABI } from './abi/RaoArbitrage.json'
import TOKENS from './tokens.json'
import { Token, Address, Exchanges } from './types'
import _sgMail from '@sendgrid/mail'

/* CONFIGURATION */
config()
export const isDevelopment = process.env['NODE_ENV'] == 'dev',
	API = process.env['API'],
	NETWORK = process.env['NETWORK']

export const THROW_NOT_FOUND_PAIR = 'THROW_NOT_FOUND_PAIR',
	THROW_NOT_FOUND_TOKEN = 'THROW_NOT_FOUND_TOKEN'

export const provider: providers.Provider = isDevelopment
		? new providers.StaticJsonRpcProvider()
		: new providers.StaticJsonRpcProvider(`https://speedy-nodes-nyc.moralis.io/${API}/${NETWORK}/mainnet`),
	signer = new Wallet(process.env['PRIVATE_KEY'], provider),
	factoryContract = new Contract(constants.AddressZero, FACTORY_ABI, provider),
	routerContract = new Contract(constants.AddressZero, ROUTER_ABI, provider),
	pairContract = new Contract(constants.AddressZero, PAIR_ABI, provider),
	tokenContract = new Contract(constants.AddressZero, TOKEN_ABI, provider),
	raoContract = new Contract('0x4c2fC697B1C0d571E04C6F2750c672BE0CB66407', RAO_ABI, provider)

_sgMail.setApiKey(process.env['SENDGRID_API_KEY'])
export const sgMail = _sgMail

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
	console.log(`🔴 purge utils`)
	for (const i of EXCHANGE_INFOS) {
		let n = i.pairs.length
		for (let _n = 0; _n < n; _n++) {
			i.pairs.pop()
		}
	}
	provider.removeAllListeners()
})
