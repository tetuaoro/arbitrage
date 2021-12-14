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
exports.__esModule = true;
var dotenv_1 = require("dotenv");
var ethers_1 = require("ethers");
var utils_1 = require("./utils");
var IUniswapV2Factory_json_1 = require("./abi/IUniswapV2Factory.json");
var IUniswapV2Router01_json_1 = require("./abi/IUniswapV2Router01.json");
var IUniswapV2Pair_json_1 = require("./abi/IUniswapV2Pair.json");
var IERC20_json_1 = require("./abi/IERC20.json");
var RaoArbitrage_json_1 = require("./abi/RaoArbitrage.json");
dotenv_1.config();
var dev = process.env['NODE_ENV'] == 'dev';
var PK = dev ? process.env['GANACHE_PRIVATE_KEY'] : process.env['PRIVATE_KEY'];
var THROW_NOT_FOUND_PAIR = 'THROW_NOT_FOUND_PAIR';
var NETWORK = 137, provider = dev
    ? new ethers_1.providers.JsonRpcProvider('http://localhost:8545', NETWORK)
    : new ethers_1.providers.InfuraProvider(NETWORK, {
        projectId: process.env['INFURA_ID'],
        projectSecret: process.env['INFURA_SECRET']
    });
var signer = new ethers_1.Wallet(PK, provider), factoryContract = new ethers_1.Contract(ethers_1.constants.AddressZero, IUniswapV2Factory_json_1.abi, provider), routerContract = new ethers_1.Contract(ethers_1.constants.AddressZero, IUniswapV2Router01_json_1.abi, provider), pairContract = new ethers_1.Contract(ethers_1.constants.AddressZero, IUniswapV2Pair_json_1.abi, provider), tokenContract = new ethers_1.Contract(ethers_1.constants.AddressZero, IERC20_json_1.abi, provider), RAO_ARBITRAGE = new ethers_1.Contract('0x7d35cd1250b8167a027669Ee5ccC90e23D31d16D', RaoArbitrage_json_1.abi, provider);
var SUSHI_FACTORY, QUICK_FACTORY, SUSHI_ROUTER, QUICK_ROUTER, SUSHI_PAIR, QUICK_PAIR, tc0, tc1, TOKEN0, TOKEN1, MATIC;
var initalize = function () { return __awaiter(void 0, void 0, void 0, function () {
    var pair, token0, temp, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Initialize...");
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                MATIC = utils_1.getToken('WMATIC');
                TOKEN0 = utils_1.getToken('WBTC');
                TOKEN1 = utils_1.getToken('WETH');
                SUSHI_FACTORY = factoryContract.attach('0xc35DADB65012eC5796536bD9864eD8773aBc74C4');
                QUICK_FACTORY = factoryContract.attach('0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32');
                SUSHI_ROUTER = routerContract.attach('0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506');
                QUICK_ROUTER = routerContract.attach('0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff');
                return [4, SUSHI_FACTORY.getPair(TOKEN0.address, TOKEN1.address)];
            case 2:
                pair = _a.sent();
                if (ethers_1.BigNumber.from(pair).eq(ethers_1.BigNumber.from(ethers_1.constants.AddressZero)))
                    throw new Error(THROW_NOT_FOUND_PAIR + ' FACTORY 1');
                SUSHI_PAIR = pairContract.attach(pair);
                return [4, SUSHI_PAIR.token0()];
            case 3:
                token0 = _a.sent();
                if (!ethers_1.BigNumber.from(token0).eq(ethers_1.BigNumber.from(TOKEN0.address))) {
                    temp = TOKEN0;
                    TOKEN0 = TOKEN1;
                    TOKEN1 = temp;
                }
                return [4, QUICK_FACTORY.getPair(TOKEN0.address, TOKEN1.address)];
            case 4:
                pair = _a.sent();
                if (ethers_1.BigNumber.from(pair).eq(ethers_1.BigNumber.from(ethers_1.constants.AddressZero)))
                    throw new Error(THROW_NOT_FOUND_PAIR + ' FACTORY 2');
                QUICK_PAIR = pairContract.attach(pair);
                tc0 = tokenContract.attach(TOKEN0.address);
                tc1 = tokenContract.attach(TOKEN1.address);
                return [3, 6];
            case 5:
                error_1 = _a.sent();
                throw error_1;
            case 6: return [2];
        }
    });
}); };
var swap = function () { return __awaiter(void 0, void 0, void 0, function () {
    var amountIn, amountOutMin, deadline, tx, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Swap...");
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                amountIn = ethers_1.utils.parseEther('3000'), amountOutMin = ethers_1.utils.parseUnits('0.00001', TOKEN0.decimals), deadline = Math.floor(Date.now() / 1000) + 30;
                return [4, QUICK_ROUTER.connect(signer).swapExactETHForTokens(amountOutMin, [MATIC.address, TOKEN0.address], signer.address, deadline, {
                        gasPrice: ethers_1.utils.parseUnits('20', 'gwei'),
                        gasLimit: ethers_1.utils.parseUnits('12', 'mwei'),
                        value: amountIn
                    })];
            case 2:
                tx = _a.sent();
                return [4, tx.wait()];
            case 3:
                _a.sent();
                return [3, 5];
            case 4:
                error_2 = _a.sent();
                throw error_2;
            case 5: return [2];
        }
    });
}); };
var COUNTER_ERROR = 0, COUNTER_SUCCESS = 0, COUNTER_FAIL = 0, COUNTER = 0;
var monitoring = function (pair, reserve0, reserve1, event) { return __awaiter(void 0, void 0, void 0, function () {
    var CONTRACT_PAIR, NAME_PAIR_BORROW, NAME_PAIR_SELL, onePercent, twoPercent, fivePercent, tenPercent, twentyPercent, fiftyPercent, percents, reserveOther, reserveIn, reserveOut, table, _i, percents_1, amountIn, amountInWithFee, numerator, denominator, amountOut, amountToRepay, gt, s1, s2, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (pair == SUSHI_PAIR.address) {
                    CONTRACT_PAIR = SUSHI_PAIR;
                    NAME_PAIR_BORROW = 'SUSHI_BORROW_IN';
                    NAME_PAIR_SELL = 'QUICK_SELL_OUT';
                }
                else {
                    CONTRACT_PAIR = QUICK_PAIR;
                    NAME_PAIR_BORROW = 'QUICK_BORROW_IN';
                    NAME_PAIR_SELL = 'SUSHI_SELL_OUT';
                }
                onePercent = reserve0.div(100), twoPercent = reserve0.div(50), fivePercent = reserve0.div(20), tenPercent = reserve0.div(10), twentyPercent = reserve0.div(5), fiftyPercent = reserve0.div(2), percents = [onePercent, twoPercent, fivePercent, tenPercent, twentyPercent, fiftyPercent];
                return [4, CONTRACT_PAIR.getReserves()];
            case 1:
                reserveOther = _a.sent(), reserveIn = reserveOther[0], reserveOut = reserveOther[1], table = [];
                for (_i = 0, percents_1 = percents; _i < percents_1.length; _i++) {
                    amountIn = percents_1[_i];
                    amountInWithFee = amountIn.mul(997), numerator = amountInWithFee.mul(reserveOut), denominator = reserveIn.mul(1000).add(amountInWithFee), amountOut = numerator.div(denominator), amountToRepay = reserve1.mul(1000).mul(amountIn).div(reserve0.mul(997)).add(1), gt = amountOut.gt(amountToRepay), s1 = gt ? amountOut.sub(amountToRepay).mul(2) : amountToRepay.sub(amountOut).mul(2), s2 = s1.div(amountOut.add(amountToRepay)).mul(1e5);
                    table.push({
                        NAME_PAIR_BORROW: ethers_1.utils.formatUnits(amountIn, TOKEN0.decimals),
                        NAME_PAIR_SELL: ethers_1.utils.formatUnits(amountOut, TOKEN1.decimals),
                        Repay: ethers_1.utils.formatUnits(amountToRepay, TOKEN1.decimals),
                        'CallSwap?': gt,
                        difference: s2.toString()
                    });
                    if (gt)
                        COUNTER_SUCCESS++;
                    else
                        COUNTER_FAIL++;
                }
                COUNTER++;
                console.log(NAME_PAIR_BORROW + " -> " + NAME_PAIR_SELL + " ///" + COUNTER);
                return [3, 3];
            case 2:
                error_3 = _a.sent();
                throw error_3;
            case 3: return [2];
        }
    });
}); };
var listener = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log("Listening...");
        try {
            SUSHI_PAIR.on('Sync', function (reserve0, reserve1, event) { return __awaiter(void 0, void 0, void 0, function () {
                var error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4, monitoring(SUSHI_PAIR.address, reserve0, reserve1, event)];
                        case 1:
                            _a.sent();
                            return [3, 3];
                        case 2:
                            error_4 = _a.sent();
                            COUNTER_ERROR++;
                            return [3, 3];
                        case 3: return [2];
                    }
                });
            }); });
            QUICK_PAIR.on('Sync', function (reserve0, reserve1, event) { return __awaiter(void 0, void 0, void 0, function () {
                var error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4, monitoring(QUICK_PAIR.address, reserve0, reserve1, event)];
                        case 1:
                            _a.sent();
                            return [3, 3];
                        case 2:
                            error_5 = _a.sent();
                            COUNTER_ERROR++;
                            return [3, 3];
                        case 3: return [2];
                    }
                });
            }); });
        }
        catch (error) {
            throw error;
        }
        return [2];
    });
}); };
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                setInterval(function () {
                    console.log("logs ///" + COUNTER);
                    console.table([
                        {
                            COUNTER_ERROR: COUNTER_ERROR,
                            COUNTER_FAIL: COUNTER_FAIL,
                            COUNTER_SUCCESS: COUNTER_SUCCESS
                        },
                    ]);
                }, 1e3 * 60);
                return [4, initalize()];
            case 1:
                _a.sent();
                return [4, listener()];
            case 2:
                _a.sent();
                return [3, 4];
            case 3:
                error_6 = _a.sent();
                console.log('####');
                console.error(error_6);
                console.log('####');
                return [3, 4];
            case 4: return [2];
        }
    });
}); })();
var close = function () {
    console.table([
        {
            COUNTER_ERROR: COUNTER_ERROR,
            COUNTER_FAIL: COUNTER_FAIL,
            COUNTER_SUCCESS: COUNTER_SUCCESS
        },
    ]);
    provider.removeAllListeners();
    console.log("Clear listener...\nDone.");
};
process.on('exit', close);
process.on('SIGINT', close);
