import { Contract } from 'ethers'
import Flashswap from './flashswap'

declare type UrlString = string
declare type Address = string
declare type Token = {
	symbol: string
	address: Address
	decimals: number
	img: UrlString
	network: number
}
declare type onSyncInfos = {
	flashswap: Flashswap
	token0: Token
	token1: Token
	pair: Contract
	pairs: Contract[]
}
declare type Exchanges = {
	name: string
	factory: Address
	router: Address
	pair: Address[]
}
