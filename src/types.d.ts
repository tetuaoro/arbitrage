import { Contract } from 'ethers'

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
	token0: Token
	token1: Token
	pair: Contract
	pairs: Contract[]
}
declare type Exchanges = {
	name: string
	factory: Address
	router: Address
	pairs: Address[]
}

declare type ServerData = {
	StartedAt: string
	LiveDate: string
	Running: string
	COUNTER: number
	COUNTER_CALL: number
	COUNTER_SUCCESS: number
	COUNTER_FAIL: number
}

declare type ServerOnSync = {
	[key: string]: string | number | boolean
}
