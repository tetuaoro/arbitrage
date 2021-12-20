import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Contract, BigNumber, constants, Event, utils } from 'ethers'
import { Token, Address, onSyncInfos } from './types'
import { required, FACTORIES, ROUTERS, pairContract, raoContract, provider, eqAddress, EXCHANGE_INFOS, setAsyncInterval } from './utils'

export default class FlashswapV2 {
	private _token0: Token
	private _token1: Token
	private _factory: Contract[]
	private _pairs: Contract[]

	public static THROW_NOT_AN_ADDRESS = 'Flashswap: THROW_NOT_AN_ADDRESS'
	public static THROW_NO_FACTORIES = 'Flashswap: THROW_NO_FACTORIES'

	constructor(token0: Token, token1: Token) {
		this._token0 = token0
		this._token1 = token1
		this._factory = FACTORIES
		this._pairs = []
	}

	/**
	 * Get pairs on alls v2 factories (AMM)
	 */
	async initialize() {
		try {
			let i = 0,
				switchTokens = false
			for (const fc of this._factory) {
				let pair: Address = await fc.getPair(this._token0.address, this._token1.address)
				required(!eqAddress(constants.AddressZero, pair), `${FlashswapV2.THROW_NOT_AN_ADDRESS} #AddressZero`)
				this._pairs.push(pairContract.attach(pair))
				EXCHANGE_INFOS[i].pair.push(pair)
				i++
				if (switchTokens) continue
				switchTokens = true
				let token0: Address = await this._pairs[this._pairs.length - 1].token0()
				if (!eqAddress(this._token0.address, token0)) {
					let temp = this._token0
					this._token0 = this._token1
					this._token1 = temp
					console.log(`\t\tswitch ${this._token0.symbol}/${this._token1.symbol}`)
				}
			}
		} catch (error) {
			throw error
		}
	}

	async onSync(fn: CallableFunction): Promise<number> {
		let kLasts: {
			k: BigNumber
			pair: Contract
		}[] = []
		for (const pair of this._pairs) {
			let kLast: BigNumber = await pair.kLast()
			kLasts.push({ k: kLast, pair })
		}

		kLasts.sort((a, b) => (a.k.gt(b.k) ? -1 : a.k.eq(b.k) ? 0 : 1))
		let extras: onSyncInfos = {
			token0: this._token0,
			token1: this._token1,
			pair: kLasts[0].pair,
			pairs: this._pairs.filter((pc) => !eqAddress(pc.address, kLasts[0].pair.address)),
		}
		kLasts[0].pair.on('Sync', (reserve0: BigNumber, reserve1: BigNumber, event: Event) => {
			try {
				fn(extras, reserve0, reserve1, event)
			} catch (error) {
				throw error
			}
		})

		return 1
	}

	static removeAllListeners() {
		provider.removeAllListeners()
	}

	static getNameExchange(address: Address) {
		for (const ex of EXCHANGE_INFOS) {
			if (
				eqAddress(ex.factory, address) ||
				eqAddress(ex.router, address) ||
				typeof ex.pair.find((p) => eqAddress(p, address)) != 'undefined'
			)
				return ex.name
		}
	}

	static getRouterContractFromPairAddress(pairAddress: Address) {
		let i = 0
		for (const ex of EXCHANGE_INFOS) {
			if (typeof ex.pair.find((p) => eqAddress(p, pairAddress)) != 'undefined') return ROUTERS[i]
			i++
		}
	}
}
