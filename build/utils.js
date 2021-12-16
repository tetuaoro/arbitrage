"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.ROUTERS = exports.FACTORIES = exports.EXCHANGE_INFOS = exports.required = exports.eqAddress = exports.getToken = exports.tokenContract = exports.pairContract = exports.routerContract = exports.factoryContract = exports.signer = exports.provider = exports.NETWORK = exports.THROW_NOT_FOUND_TOKEN = exports.THROW_NOT_FOUND_PAIR = exports.isDevelopment = void 0;
var dotenv_1 = require("dotenv");
var ethers_1 = require("ethers");
var IUniswapV2Factory_json_1 = require("./abi/IUniswapV2Factory.json");
var IUniswapV2Router01_json_1 = require("./abi/IUniswapV2Router01.json");
var IUniswapV2Pair_json_1 = require("./abi/IUniswapV2Pair.json");
var IERC20_json_1 = require("./abi/IERC20.json");
var tokens_json_1 = __importDefault(require("./tokens.json"));
dotenv_1.config();
exports.isDevelopment = process.env['NODE_ENV'] == 'dev';
exports.THROW_NOT_FOUND_PAIR = 'THROW_NOT_FOUND_PAIR', exports.THROW_NOT_FOUND_TOKEN = 'THROW_NOT_FOUND_TOKEN';
exports.NETWORK = 137, exports.provider = exports.isDevelopment
    ? new ethers_1.providers.JsonRpcProvider('http://localhost:8545', exports.NETWORK)
    : new ethers_1.providers.InfuraProvider(exports.NETWORK, {
        projectId: process.env['INFURA_ID'],
        projectSecret: process.env['INFURA_SECRET']
    }), exports.signer = new ethers_1.Wallet(exports.isDevelopment ? process.env['GANACHE_PRIVATE_KEY'] : process.env['PRIVATE_KEY'], exports.provider), exports.factoryContract = new ethers_1.Contract(ethers_1.constants.AddressZero, IUniswapV2Factory_json_1.abi, exports.provider), exports.routerContract = new ethers_1.Contract(ethers_1.constants.AddressZero, IUniswapV2Router01_json_1.abi, exports.provider), exports.pairContract = new ethers_1.Contract(ethers_1.constants.AddressZero, IUniswapV2Pair_json_1.abi, exports.provider), exports.tokenContract = new ethers_1.Contract(ethers_1.constants.AddressZero, IERC20_json_1.abi, exports.provider);
exports.getToken = function (symbol) {
    var token = tokens_json_1["default"].find(function (t) { return t.symbol == symbol; });
    if (typeof token === 'undefined')
        throw new Error(exports.THROW_NOT_FOUND_TOKEN);
    return token;
};
exports.eqAddress = function (address0, address1) {
    return ethers_1.utils.isAddress(address0) && ethers_1.utils.isAddress(address1) && ethers_1.BigNumber.from(address0).eq(ethers_1.BigNumber.from(address1));
};
exports.required = function (condition, message) {
    if (!condition)
        throw new Error(message || 'Required: Une erreur est survenue !');
};
exports.EXCHANGE_INFOS = [
    {
        name: 'Sushiswap',
        factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
        router: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
        pair: []
    },
    {
        name: 'Quickswap',
        factory: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
        router: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
        pair: []
    },
    {
        name: 'Apeswap',
        factory: '0xCf083Be4164828f00cAE704EC15a36D711491284',
        router: '0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607',
        pair: []
    },
    {
        name: 'Jetswap',
        factory: '0x668ad0ed2622C62E24f0d5ab6B6Ac1b9D2cD4AC7',
        router: '0x5C6EC38fb0e2609672BDf628B1fD605A523E5923',
        pair: []
    },
];
exports.FACTORIES = exports.EXCHANGE_INFOS.map(function (i) { return exports.factoryContract.attach(i.factory); });
exports.ROUTERS = exports.EXCHANGE_INFOS.map(function (i) { return exports.routerContract.attach(i.router); });
