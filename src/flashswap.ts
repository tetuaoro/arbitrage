import { providers, Contract, BigNumber, constants, Event } from 'ethers'
import { required, FACTORIES, ROUTERS, pairContract, provider, eqAddress, EXCHANGE_INFOS } from './utils'

export default class Flashswap {
	private _token0: Token
	private _token1: Token
	private _provider: providers.Provider
	private _factory: Contract[]
	private _routers: Contract[]
	private _pairs: Contract[]

	public static THROW_NOT_AN_ADDRESS = 'Flashswap: THROW_NOT_AN_ADDRESS'
	public static THROW_NO_FACTORIES = 'Flashswap: THROW_NO_FACTORIES'

	constructor(token0: Token, token1: Token) {
		this._token0 = token0
		this._token1 = token1
		this._provider = provider
		this._factory = FACTORIES
		this._routers = ROUTERS
		this._pairs = []
	}

	async initialize() {
		try {
			let i = 0
			for (const fc of this._factory) {
				let pair: Address = await fc.getPair(this._token0.address, this._token1.address)
				required(!eqAddress(constants.AddressZero, pair), `${Flashswap.THROW_NOT_AN_ADDRESS} #AddressZero`)
				this._pairs.push(pairContract.attach(pair))
				EXCHANGE_INFOS[i].pair = pair
				i++
				let token0: Address = await this._pairs[this._pairs.length - 1].token0()
				if (!eqAddress(this._token0.address, token0)) {
					let temp = this._token0
					this._token0 = this._token1
					this._token1 = temp
				}
			}
		} catch (error) {
			throw error
		}
	}

	/**
	 * parameters (extras, BigNumber, BigNumber, Event)
	 *
	 * @param {CallableFunction} fn
	 * @memberof Flashswap
	 */
	onSync(fn: CallableFunction) {
		for (const pair of this._pairs) {
			let infos = {
				token0: this._token0,
				token1: this._token1,
				pair,
				pairs: this._pairs.filter((pc) => pc.address != pair.address),
			}
			pair.on('Sync', (reserve0: BigNumber, reserve1: BigNumber, event: Event) => {
				try {
					fn(infos, reserve0, reserve1, event)
				} catch (error) {
					throw error
				}
			})
		}
	}

	static removeAllListeners() {
		provider.removeAllListeners()
	}

	static getNameExchange(address: Address) {
		let exchange = EXCHANGE_INFOS.find((i) => i.pair == address)
		if (typeof exchange === 'undefined') return ''
		return exchange.name
	}
}
