import { BigNumber } from 'ethers'

declare type Address = string
declare type PairsAddresses = [Address, Address, Address]
declare type Reserves = [BigNumber, BigNumber, BigNumber]
declare type Result = {
	rewards: BigNumber
	reserveIndex: number
	exchangesIndexs: [number, number]
	percent: number
	borrow: BigNumber
	repay: BigNumber
	amountOut: BigNumber
}
declare type Flashswap = {
	pairBorrow: Address
	pairSell: Address
	routerSell: Address
	percent: number
	blockNumber: number
	borrow: BigNumber
	repay: BigNumber
	amountOut: BigNumber
}
declare type ServerData = {
	id: number
	STARTED_AT: number | string
	UPTIME: number | string
	BLOCKNUMBER: number
	LOCK_LISTENER_ON_BLOCK: boolean
	LOCK_CLOSE: boolean
	AVERAGE_GBO_COMPUTE_TIME: number
	COUNTER_ERROR: number
	COUNTER_STARTED: number
	COUNTER_OPPORTUNITY: number
	COUNTER_ON_BLOCK: number
	ABUSE_PAIR: Address[]
	TOKEN_ADDRESSES: Address[]
	FACTORY_ADDRESSES: Address[]
	PAIR_ADDRESSES: Address[]
}
