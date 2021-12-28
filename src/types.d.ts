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
