"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.clearAllAsyncInterval = exports.clearAsyncInterval = exports.setAsyncInterval = exports.ROUTERS = exports.FACTORIES = exports.EXCHANGE_INFOS = exports.required = exports.eqAddress = exports.getToken = exports.switchInfuraProvider = exports.raoContract = exports.tokenContract = exports.pairContract = exports.routerContract = exports.factoryContract = exports.signer = exports.provider = exports.NETWORK = exports.THROW_NOT_FOUND_TOKEN = exports.THROW_NOT_FOUND_PAIR = exports.isDevelopment = void 0;
var dotenv_1 = require("dotenv");
var ethers_1 = require("ethers");
var IUniswapV2Factory_json_1 = require("./abi/IUniswapV2Factory.json");
var IUniswapV2Router01_json_1 = require("./abi/IUniswapV2Router01.json");
var IUniswapV2Pair_json_1 = require("./abi/IUniswapV2Pair.json");
var IERC20_json_1 = require("./abi/IERC20.json");
var RaoArbitrage_json_1 = require("./abi/RaoArbitrage.json");
var tokens_json_1 = __importDefault(require("./tokens.json"));
dotenv_1.config();
exports.isDevelopment = process.env['NODE_ENV'] == 'dev';
exports.THROW_NOT_FOUND_PAIR = 'THROW_NOT_FOUND_PAIR', exports.THROW_NOT_FOUND_TOKEN = 'THROW_NOT_FOUND_TOKEN';
exports.NETWORK = 137;
var INFURA_IDS = process.env['INFURA_IDS'].split(','), INFURA_SECRETS = process.env['INFURA_SECRETS'].split(',');
var INFURA_INDEX = 0;
exports.provider = exports.isDevelopment
    ? new ethers_1.providers.JsonRpcProvider('http://localhost:8545', exports.NETWORK)
    : new ethers_1.providers.InfuraProvider(exports.NETWORK, {
        projectId: INFURA_IDS[INFURA_INDEX],
        projectSecret: INFURA_SECRETS[INFURA_INDEX]
    });
exports.signer = new ethers_1.Wallet(exports.isDevelopment ? process.env['GANACHE_PRIVATE_KEY'] : process.env['PRIVATE_KEY'], exports.provider), exports.factoryContract = new ethers_1.Contract(ethers_1.constants.AddressZero, IUniswapV2Factory_json_1.abi, exports.provider), exports.routerContract = new ethers_1.Contract(ethers_1.constants.AddressZero, IUniswapV2Router01_json_1.abi, exports.provider), exports.pairContract = new ethers_1.Contract(ethers_1.constants.AddressZero, IUniswapV2Pair_json_1.abi, exports.provider), exports.tokenContract = new ethers_1.Contract(ethers_1.constants.AddressZero, IERC20_json_1.abi, exports.provider), exports.raoContract = new ethers_1.Contract('0x4c2fC697B1C0d571E04C6F2750c672BE0CB66407', RaoArbitrage_json_1.abi, exports.provider);
exports.switchInfuraProvider = function () {
    exports.provider.removeAllListeners();
    INFURA_INDEX = (INFURA_INDEX + 1) % INFURA_SECRETS.length;
    var apiKey = {
        projectId: INFURA_IDS[INFURA_INDEX],
        projectSecret: INFURA_SECRETS[INFURA_INDEX]
    };
    exports.provider = new ethers_1.providers.InfuraProvider(exports.NETWORK, apiKey);
    exports.signer = exports.signer.connect(exports.provider);
    exports.factoryContract = exports.factoryContract.connect(exports.provider);
    exports.routerContract = exports.routerContract.connect(exports.provider);
    exports.pairContract = exports.pairContract.connect(exports.provider);
    exports.tokenContract = exports.tokenContract.connect(exports.provider);
    exports.raoContract = exports.raoContract.connect(exports.provider);
    for (var _i = 0, EXCHANGE_INFOS_1 = exports.EXCHANGE_INFOS; _i < EXCHANGE_INFOS_1.length; _i++) {
        var i = EXCHANGE_INFOS_1[_i];
        exports.FACTORIES.shift();
        exports.ROUTERS.shift();
        var ln = i.pairs.length;
        for (var index = 0; index < ln; index++) {
            i.pairs.pop();
        }
        exports.FACTORIES.push(exports.factoryContract.attach(i.factory));
        exports.ROUTERS.push(exports.routerContract.attach(i.router));
    }
};
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
        pairs: []
    },
    {
        name: 'Quickswap',
        factory: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
        router: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
        pairs: []
    },
    {
        name: 'Apeswap',
        factory: '0xCf083Be4164828f00cAE704EC15a36D711491284',
        router: '0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607',
        pairs: []
    },
    {
        name: 'Jetswap',
        factory: '0x668ad0ed2622C62E24f0d5ab6B6Ac1b9D2cD4AC7',
        router: '0x5C6EC38fb0e2609672BDf628B1fD605A523E5923',
        pairs: []
    },
];
exports.FACTORIES = exports.EXCHANGE_INFOS.map(function (i) { return exports.factoryContract.attach(i.factory); }), exports.ROUTERS = exports.EXCHANGE_INFOS.map(function (i) { return exports.routerContract.attach(i.router); });
var asyncIntervals = [];
var runAsyncInterval = function (cb, interval, intervalIndex) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, cb()];
            case 1:
                _a.sent();
                if (asyncIntervals[intervalIndex]) {
                    setTimeout(function () { return runAsyncInterval(cb, interval, intervalIndex); }, interval);
                }
                return [2];
        }
    });
}); };
exports.setAsyncInterval = function (cb, interval) {
    if (cb && typeof cb === 'function') {
        var intervalIndex = asyncIntervals.length;
        asyncIntervals.push(true);
        runAsyncInterval(cb, interval, intervalIndex);
        return intervalIndex;
    }
    else {
        throw new Error('Callback must be a function');
    }
};
exports.clearAsyncInterval = function (intervalIndex) {
    if (asyncIntervals[intervalIndex]) {
        asyncIntervals[intervalIndex] = false;
    }
};
exports.clearAllAsyncInterval = function () {
    for (var _i = 0, asyncIntervals_1 = asyncIntervals; _i < asyncIntervals_1.length; _i++) {
        var ai = asyncIntervals_1[_i];
        ai = false;
    }
};
