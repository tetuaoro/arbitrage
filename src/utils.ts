import * as TOKENS from './tokens.json'

export const THROW_NOT_FOUND_TOKEN = 'THROW_NOT_FOUND_TOKEN'
export const getToken = (symbol: string): TOKEN => {
	const token = TOKENS.find((t) => t.symbol == symbol)
	if (typeof token === 'undefined') throw new Error(THROW_NOT_FOUND_TOKEN)
	return token
}
