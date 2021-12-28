import { config } from 'dotenv'
import { providers, Contract, BigNumber, Wallet } from 'ethers'
import QUERY_ABI from './abi/RaoUniswapQuery-lite.json'
import RAO_ABI from './abi/RaoArbitrage-lite.json'
import _sgMail from '@sendgrid/mail'

/* CONFIGURATION */
config()

export const isDev = process.env['NODE_ENV'] == 'dev',
	staticNetwork = { name: 'matic', chainId: 137, ensAddress: null, _defaultProvider: null },
	moralis = new providers.StaticJsonRpcProvider(isDev ? null : process.env['RPC_URL'], staticNetwork),
	signer = new Wallet(isDev ? process.env['GANACHE_PK'] : process.env['PRIVATE_KEY'], moralis),
	queryContract = new Contract(process.env['RAOUNISWAPQUERY'], QUERY_ABI, moralis), // 0x778B312DD183479c89D18620D547b96cc2eA2beA prod
	raoContract = new Contract(process.env['RAOARBITRAGE'], RAO_ABI, moralis)

const SUSHI_FACTORY = '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
	QUICK_FACTORY = '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
	APE_FACTORY = '0xCf083Be4164828f00cAE704EC15a36D711491284',
	SUSHI_ROUTER = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
	QUICK_ROUTER = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
	APE_ROUTER = '0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607'

export const FACTORY_ADDRESSES = [SUSHI_FACTORY, QUICK_FACTORY, APE_FACTORY],
	ROUTER_ADDRESSES = [SUSHI_ROUTER, QUICK_ROUTER, APE_ROUTER]

_sgMail.setApiKey(process.env['SENDGRID_API_KEY'])
export const sgMail = _sgMail

export const sliceArray = (cut: number, array: Array<any>) => {
		const ARRAY = [],
			inter = array.length / cut
		for (let i = 0; i < cut; i++) {
			ARRAY.push(array.slice(inter * i, inter * (i + 1)))
		}
		return ARRAY
	},
	getAmountOut = (amountIn: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber) =>
		amountIn
			.mul(997)
			.mul(reserveOut)
			.div(reserveIn.mul(1000).add(amountIn.mul(997))),
	getAmountOutToPayback = (amountIn: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber) =>
		reserveOut.mul(1000).mul(amountIn).div(reserveIn.mul(997)).add(1)

process.on('exit', () => {
	console.log(`🔴 purge utils`)
	moralis.removeAllListeners()
})
