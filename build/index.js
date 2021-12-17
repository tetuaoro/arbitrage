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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var ethers_1 = require("ethers");
var dayjs_1 = __importDefault(require("dayjs"));
var utc_1 = __importDefault(require("dayjs/plugin/utc"));
var timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
var fr_1 = __importDefault(require("dayjs/locale/fr"));
var flashswap_1 = __importDefault(require("./flashswap"));
var utils_1 = require("./utils");
dayjs_1["default"].extend(utc_1["default"]);
dayjs_1["default"].extend(timezone_1["default"]);
dayjs_1["default"].locale(fr_1["default"]);
dayjs_1["default"].tz.setDefault('Pacific/Tahiti');
var FLASHSWAPS = [];
var BLOCKNUMBER = 0, COUNTER_SUCCESS = 0, COUNTER_CALL = 0, COUNTER_FAIL = 0, COUNTER = 0, LOCK_ON_SYNC = true;
var onSync = function (infos, reserve0, reserve1, event) { return __awaiter(void 0, void 0, void 0, function () {
    var pc, others, token0, token1, flashswap, onePercent, twoPercent, fivePercent, tenPercent, twentyPercent, fiftyPercent, percentsToNumber, percents, amountsPayback, _i, percents_1, amountInPercent, promiseReserveOthers, _a, others_1, pair, reserveOthers, promiseReserveOthers_1, promiseReserveOthers_1_1, reserves, e_1_1, table, showTable, i, _b, reserveOthers_1, reserve, j, lastSuccessCall, _c, amountsPayback_1, amountPayback, amountIn, amountInWithFee, numerator, denominator, amountOut, gt, error_1;
    var _d;
    var e_1, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 13, , 14]);
                COUNTER_CALL++;
                if (LOCK_ON_SYNC)
                    return [2];
                if (event.blockNumber == BLOCKNUMBER)
                    return [2];
                BLOCKNUMBER = event.blockNumber;
                pc = infos.pair, others = infos.pairs, token0 = infos.token0, token1 = infos.token1, flashswap = infos.flashswap;
                onePercent = reserve0.div(100), twoPercent = reserve0.div(50), fivePercent = reserve0.div(20), tenPercent = reserve0.div(10), twentyPercent = reserve0.div(5), fiftyPercent = reserve0.div(2), percentsToNumber = [1, 2, 5, 10, 20, 50], percents = [onePercent, twoPercent, fivePercent, tenPercent, twentyPercent, fiftyPercent];
                amountsPayback = [];
                for (_i = 0, percents_1 = percents; _i < percents_1.length; _i++) {
                    amountInPercent = percents_1[_i];
                    amountsPayback.push(reserve1.mul(1000).mul(amountInPercent).div(reserve0.mul(997)).add(1));
                }
                promiseReserveOthers = [];
                for (_a = 0, others_1 = others; _a < others_1.length; _a++) {
                    pair = others_1[_a];
                    promiseReserveOthers.push(pair.getReserves());
                }
                reserveOthers = [];
                _f.label = 1;
            case 1:
                _f.trys.push([1, 6, 7, 12]);
                promiseReserveOthers_1 = __asyncValues(promiseReserveOthers);
                _f.label = 2;
            case 2: return [4, promiseReserveOthers_1.next()];
            case 3:
                if (!(promiseReserveOthers_1_1 = _f.sent(), !promiseReserveOthers_1_1.done)) return [3, 5];
                reserves = promiseReserveOthers_1_1.value;
                reserveOthers.push({ r0: reserves[0], r1: reserves[1] });
                _f.label = 4;
            case 4: return [3, 2];
            case 5: return [3, 12];
            case 6:
                e_1_1 = _f.sent();
                e_1 = { error: e_1_1 };
                return [3, 12];
            case 7:
                _f.trys.push([7, , 10, 11]);
                if (!(promiseReserveOthers_1_1 && !promiseReserveOthers_1_1.done && (_e = promiseReserveOthers_1["return"]))) return [3, 9];
                return [4, _e.call(promiseReserveOthers_1)];
            case 8:
                _f.sent();
                _f.label = 9;
            case 9: return [3, 11];
            case 10:
                if (e_1) throw e_1.error;
                return [7];
            case 11: return [7];
            case 12:
                table = [];
                showTable = false, i = 0;
                for (_b = 0, reserveOthers_1 = reserveOthers; _b < reserveOthers_1.length; _b++) {
                    reserve = reserveOthers_1[_b];
                    j = 0, lastSuccessCall = void 0;
                    for (_c = 0, amountsPayback_1 = amountsPayback; _c < amountsPayback_1.length; _c++) {
                        amountPayback = amountsPayback_1[_c];
                        amountIn = percents[j], amountInWithFee = amountIn.mul(997), numerator = amountInWithFee.mul(reserve.r1), denominator = reserve.r0.mul(1000).add(amountInWithFee), amountOut = numerator.div(denominator), gt = amountOut.gt(amountPayback);
                        if (gt) {
                            lastSuccessCall = amountIn;
                            COUNTER_SUCCESS++;
                            table.push((_d = {
                                    '#': percentsToNumber[j] + "%"
                                },
                                _d[token0.symbol + "_BORROW"] = ethers_1.utils.formatUnits(amountIn, token0.decimals),
                                _d.BLOCKNUMBER = BLOCKNUMBER,
                                _d.Sell = flashswap_1["default"].getNameExchange(others[i].address),
                                _d[token1.symbol] = ethers_1.utils.formatUnits(amountOut, token1.decimals),
                                _d[token1.symbol + "_PAYBACK"] = ethers_1.utils.formatUnits(amountPayback, token1.decimals),
                                _d['Call?'] = gt,
                                _d));
                            showTable = true;
                        }
                        else
                            COUNTER_FAIL++;
                        j++;
                    }
                    if (typeof lastSuccessCall != 'undefined') {
                        LOCK_ON_SYNC = true;
                        flashswap.callFlashswap(lastSuccessCall, pc, others[i], LOCK_ON_SYNC);
                    }
                    table.push({});
                    i++;
                }
                if (showTable) {
                    console.log("Borrow : " + flashswap_1["default"].getNameExchange(pc.address));
                    console.table(table);
                }
                COUNTER++;
                return [3, 14];
            case 13:
                error_1 = _f.sent();
                throw error_1;
            case 14: return [2];
        }
    });
}); };
var logs = function () {
    console.table({ PID: process.pid, Date: dayjs_1["default"]().format('D/M/YYYY H:m:s'), COUNTER: COUNTER, COUNTER_CALL: COUNTER_CALL, COUNTER_SUCCESS: COUNTER_SUCCESS, COUNTER_FAIL: COUNTER_FAIL });
};
var app = function () { return __awaiter(void 0, void 0, void 0, function () {
    var tokenA, tokenB, tokenC, tokenE, tokens, i, _i, tokens_1, t0, j, _a, tokens_2, t1, flashswap, error_2, _b, FLASHSWAPS_1, flashswap, _c, error_3;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                console.log("App start " + dayjs_1["default"]().format('D/M/YYYY H:m:s'));
                _d.label = 1;
            case 1:
                _d.trys.push([1, 15, , 16]);
                setInterval(logs, 1e3 * 45);
                tokenA = utils_1.getToken('WMATIC'), tokenB = utils_1.getToken('WBTC'), tokenC = utils_1.getToken('WETH'), tokenE = utils_1.getToken('USDC');
                tokens = [tokenA, tokenB, tokenC, tokenE];
                console.log("Create instances");
                i = 0;
                _i = 0, tokens_1 = tokens;
                _d.label = 2;
            case 2:
                if (!(_i < tokens_1.length)) return [3, 10];
                t0 = tokens_1[_i];
                j = -1;
                _a = 0, tokens_2 = tokens;
                _d.label = 3;
            case 3:
                if (!(_a < tokens_2.length)) return [3, 8];
                t1 = tokens_2[_a];
                j++;
                if (i >= j)
                    return [3, 7];
                flashswap = new flashswap_1["default"](t0, t1);
                _d.label = 4;
            case 4:
                _d.trys.push([4, 6, , 7]);
                console.log("\tflashswap[" + j + "] " + t0.symbol + "/" + t1.symbol);
                return [4, flashswap.initialize()];
            case 5:
                _d.sent();
                FLASHSWAPS.push(flashswap);
                return [3, 7];
            case 6:
                error_2 = _d.sent();
                console.log("error instanciate at " + i + "-" + j);
                throw error_2;
            case 7:
                _a++;
                return [3, 3];
            case 8:
                i++;
                _d.label = 9;
            case 9:
                _i++;
                return [3, 2];
            case 10:
                console.log("--> Created");
                console.log("Create listeners");
                i = 0;
                _b = 0, FLASHSWAPS_1 = FLASHSWAPS;
                _d.label = 11;
            case 11:
                if (!(_b < FLASHSWAPS_1.length)) return [3, 14];
                flashswap = FLASHSWAPS_1[_b];
                _c = i;
                return [4, flashswap.onSync(onSync)];
            case 12:
                i = _c + _d.sent();
                _d.label = 13;
            case 13:
                _b++;
                return [3, 11];
            case 14:
                console.log("--> Created " + i + " listeners");
                LOCK_ON_SYNC = false;
                return [3, 16];
            case 15:
                error_3 = _d.sent();
                throw error_3;
            case 16: return [2];
        }
    });
}); };
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Arbitrage start");
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4, app()];
            case 2:
                _a.sent();
                return [3, 4];
            case 3:
                error_4 = _a.sent();
                console.error('###');
                console.error(error_4);
                console.error('###');
                return [3, 4];
            case 4: return [2];
        }
    });
}); })();
var LOCK_CLOSE = false;
var close = function () {
    if (LOCK_CLOSE)
        return;
    LOCK_CLOSE = true;
    console.log("\nexit///");
    logs();
    utils_1.clearAllAsyncInterval();
    flashswap_1["default"].removeAllListeners();
    process.exit();
};
process.on('exit', close);
process.on('SIGINT', close);
