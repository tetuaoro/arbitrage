module.exports = {
  contracts_build_directory: './src/abi',
  contracts_directory: './contracts',
	networks: {
		development: {
			host: '127.0.0.1',
			port: 8545,
			network_id: '*',
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
