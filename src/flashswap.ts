import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider'
import { Contract, BigNumber, constants, Event, utils } from 'ethers'
import { Token, Address, onSyncInfos } from './types'
import { required, FACTORIES, ROUTERS, pairContract, raoContract, provider, eqAddress, EXCHANGE_INFOS, setAsyncInterval } from './utils'

export default class Flashswap {
	private _token0: Token
	private _token1: Token
	private _factory: Contract[]
	private _routers: Contract[]
	private _pairs: Contract[]

	public static THROW_NOT_AN_ADDRESS = 'Flashswap: THROW_NOT_AN_ADDRESS'
	public static THROW_NO_FACTORIES = 'Flashswap: THROW_NO_FACTORIES'

	constructor(token0: Token, token1: Token) {
		this._token0 = token0
		this._token1 = token1
		this._factory = FACTORIES
		this._routers = ROUTERS
		this._pairs = []
	}

	async initialize() {
		try {
			let i = 0,
				switchTokens = false
			for (const fc of this._factory) {
				let pair: Address = await fc.getPair(this._token0.address, this._token1.address)
				required(!eqAddress(constants.AddressZero, pair), `${Flashswap.THROW_NOT_AN_ADDRESS} #AddressZero`)
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

	private async _callFlashswap(amountIn: BigNumber, pair: Contract, pair2: Contract, lock: boolean) {
		try {
			let router = Flashswap.getRouterContractFromPairAddress(pair2.address)
			if (typeof router === 'undefined') {
			}

			let flash = utils.defaultAbiCoder.encode(
					['FlashData(uint256 amountBorrow, address pairBorrow, address routerSell)'],
					[{ amountBorrow: amountIn, pairBorrow: pair.address, routerSell: router.address }]
				),
				deadline = Math.floor(Date.now() / 1000) + 30,
				tx: TransactionResponse = await raoContract.callStatic.flashswap(flash, deadline, {
					gasLimit: utils.parseUnits('2', 'mwei'),
					gasPrice: utils.parseUnits('380', 'gwei'),
				}),
				receipt = await tx.wait(2)
			lock = false
			console.log(receipt)
			process.exit()
		} catch (error) {
			console.log(error)
		}
	}

	async callFlashswap(amountIn: BigNumber, pair: Contract, pair2: Contract, lock: boolean) {
		try {
			setAsyncInterval(() => {
				this._callFlashswap(amountIn, pair, pair2, lock)
			}, 0)
		} catch (error) {
			throw error
		}
	}

	async onSync(fn: CallableFunction): Promise<number> {
		let kLasts: BigNumber[] = [],
			_pairs: Contract[] = []
		for (const pair of this._pairs) {
			let kLast: BigNumber = await pair.kLast()
			kLasts.push(kLast)
		}
		let myAvg = kLasts
				.reduce((a, b) => a.add(b))
				.div(kLasts.length)
				.div(1000),
			i = 0
		for (const kLast of kLasts) {
			if (kLast.gt(myAvg)) _pairs.push(this._pairs[i])
			i++
		}
		let listenerInstanciated = 0
		for (const pair of _pairs) {
			if (_pairs.length == 1) continue
			listenerInstanciated++
			let infos: onSyncInfos = {
				flashswap: this,
				token0: this._token0,
				token1: this._token1,
				pair,
				pairs: _pairs.filter((pc) => !eqAddress(pc.address, pair.address)),
			}
			pair.on('Sync', (reserve0: BigNumber, reserve1: BigNumber, event: Event) => {
				try {
					fn(infos, reserve0, reserve1, event)
				} catch (error) {
					throw error
				}
			})
		}
		return listenerInstanciated
	}

	static removeAllListeners() {
		provider.removeAllListeners()
	}

	static getNameExchange(address: Address) {
		let exchange = address.slice(0, 8)
		for (const ex of EXCHANGE_INFOS) {
			if (
				eqAddress(ex.factory, address) ||
				eqAddress(ex.router, address) ||
				typeof ex.pair.find((p) => eqAddress(p, address)) != 'undefined'
			) {
				exchange = ex.name
				break
			}
		}
		return exchange
	}

	static getRouterContractFromPairAddress(pairAddress: Address) {
		let i = 0
		for (const ex of EXCHANGE_INFOS) {
			if (typeof ex.pair.find((p) => eqAddress(p, pairAddress)) != 'undefined') return ROUTERS[i]
			i++
		}
	}
}
