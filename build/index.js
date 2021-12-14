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
var THROW_NOT_FOUND_PAIR = 'THROW_NOT_FOUND_PAIR';
var provider = new ethers_1.providers.JsonRpcProvider('http://localhost:8545', 137), signer = new ethers_1.Wallet(process.env['GANACHE_PRIVATE_KEY'], provider), factoryContract = new ethers_1.Contract(ethers_1.constants.AddressZero, IUniswapV2Factory_json_1.abi, provider), routerContract = new ethers_1.Contract(ethers_1.constants.AddressZero, IUniswapV2Router01_json_1.abi, provider), pairContract = new ethers_1.Contract(ethers_1.constants.AddressZero, IUniswapV2Pair_json_1.abi, provider), tokenContract = new ethers_1.Contract(ethers_1.constants.AddressZero, IERC20_json_1.abi, provider), RAO_ARBITRAGE = new ethers_1.Contract('0xf3573E68D01849Fb33FD3c880F703503E946da93', RaoArbitrage_json_1.abi, provider);
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
var app = function () { return __awaiter(void 0, void 0, void 0, function () {
    var balanceOf, path, sushi_amounts, quick_amounts, routerExpensive, routerCheap, deadline, res, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("App...");
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                return [4, tc0.balanceOf(signer.address)];
            case 2:
                balanceOf = _a.sent();
                console.log("balanceOf " + TOKEN0.symbol + " " + ethers_1.utils.formatUnits(balanceOf, TOKEN0.decimals));
                path = [TOKEN0.address, TOKEN1.address];
                return [4, SUSHI_ROUTER.getAmountsOut(balanceOf, path)];
            case 3:
                sushi_amounts = _a.sent();
                return [4, QUICK_ROUTER.getAmountsOut(balanceOf, path)];
            case 4:
                quick_amounts = _a.sent();
                if (sushi_amounts[1].gt(quick_amounts[1])) {
                    routerCheap = SUSHI_ROUTER.address;
                    routerExpensive = QUICK_ROUTER.address;
                }
                else {
                    routerCheap = QUICK_ROUTER.address;
                    routerExpensive = SUSHI_ROUTER.address;
                }
                deadline = Math.floor(Date.now() / 1000) + 30;
                return [4, RAO_ARBITRAGE.swap(TOKEN0.address, TOKEN1.address, routerExpensive, routerCheap, balanceOf, deadline)];
            case 5:
                res = _a.sent();
                console.log("rao says " + ethers_1.utils.formatUnits(res, TOKEN0.decimals));
                console.table([
                    {
                        sushiOut: ethers_1.utils.formatUnits(sushi_amounts[1], TOKEN1.decimals),
                        quickOut: ethers_1.utils.formatUnits(quick_amounts[1], TOKEN1.decimals)
                    },
                ]);
                return [3, 7];
            case 6:
                error_3 = _a.sent();
                throw error_3;
            case 7: return [2];
        }
    });
}); };
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4, initalize()];
            case 1:
                _a.sent();
                return [4, swap()];
            case 2:
                _a.sent();
                return [4, app()];
            case 3:
                _a.sent();
                return [3, 5];
            case 4:
                error_4 = _a.sent();
                console.error(error_4);
                return [3, 5];
            case 5: return [2];
        }
    });
}); })();
