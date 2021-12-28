const HDWalletProvider = require('@truffle/hdwallet-provider')
require('dotenv').config()
const hdWAllet = new HDWalletProvider({
	privateKeys: [process.env['PRIVATE_KEY']],
	providerOrUrl: process.env['RPC_URL'],
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
