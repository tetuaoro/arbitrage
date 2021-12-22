const HDWalletProvider = require('@truffle/hdwallet-provider')
require('dotenv').config()
const secret = process.env['INFURA_SECRETS'].split(',')[2],
	id = process.env['INFURA_IDS'].split(',')[2]
const hdWAllet = new HDWalletProvider({
	privateKeys: [process.env['PRIVATE_KEY']],
	providerOrUrl: `https://:${secret}@polygon-mainnet.infura.io/v3/${id}`,
})

module.exports = {
	contracts_build_directory: './src/abi',
	contracts_directory: './contracts',
	networks: {
		development: {
			host: '127.0.0.1',
			port: 8545,
			network_id: '*',
		},
		polygon: {
			provider: () => hdWAllet,
			network_id: 137,
			confirmations: 2,
			timeoutBlocks: 200,
			skipDryRun: true,
			chainId: 137,
		},
	},

	mocha: {},

	compilers: {
		solc: {
			version: '0.8.0',
		},
	},

	db: {
		enabled: false,
	},
}
