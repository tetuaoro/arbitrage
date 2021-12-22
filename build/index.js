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
var utils_2 = require("ethers/lib/utils");
dayjs_1["default"].extend(utc_1["default"]);
dayjs_1["default"].extend(timezone_1["default"]);
dayjs_1["default"].locale(fr_1["default"]);
dayjs_1["default"].tz.setDefault('Pacific/Tahiti');
var BLOCKNUMBER = 0, COUNTER_SUCCESS = 0, COUNTER_CALL = 0, COUNTER_FAIL = 0, COUNTER = 0, LOCK_ON_SYNC = true;
var onSync = function (infos, _r0, _r1, event) { return __awaiter(void 0, void 0, void 0, function () {
    var t0, pc_1, others, token0, token1, _a, reserve0, reserve1, ts, time, onePercent, twoPercent, fivePercent, tenPercent, twentyPercent, fiftyPercent, percentsToNumber, percents, amountsPayback, _i, percents_1, amountInPercent, promiseReserveOthers, _b, others_1, pair, reserveOthers, promiseReserveOthers_1, promiseReserveOthers_1_1, reserves, e_1_1, table, i, diff, lastSuccessBigCall_1, _c, reserveOthers_1, reserve, j, _d, amountsPayback_1, amountPayback, amountIn, amountInWithFee, numerator, denominator, amountOut, gt, diff2, error_1;
    var _e;
    var e_1, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                _g.trys.push([0, 14, , 15]);
                COUNTER_CALL++;
                if (LOCK_ON_SYNC || event.blockNumber <= BLOCKNUMBER)
                    return [2];
                BLOCKNUMBER = event.blockNumber;
                t0 = Date.now();
                pc_1 = infos.pair, others = infos.pairs, token0 = infos.token0, token1 = infos.token1;
                return [4, pc_1.getReserves()];
            case 1:
                _a = _g.sent(), reserve0 = _a[0], reserve1 = _a[1], ts = _a[2];
                time = t0 / 1000 - ts;
                if (time > 6)
                    return [2];
                onePercent = reserve0.div(100), twoPercent = reserve0.div(50), fivePercent = reserve0.div(20), tenPercent = reserve0.div(10), twentyPercent = reserve0.div(5), fiftyPercent = reserve0.div(2), percentsToNumber = [1, 2, 5, 10, 20, 50], percents = [onePercent, twoPercent, fivePercent, tenPercent, twentyPercent, fiftyPercent];
                amountsPayback = [];
                for (_i = 0, percents_1 = percents; _i < percents_1.length; _i++) {
                    amountInPercent = percents_1[_i];
                    amountsPayback.push(reserve1.mul(1000).mul(amountInPercent).div(reserve0.mul(997)).add(1));
                }
                promiseReserveOthers = [];
                for (_b = 0, others_1 = others; _b < others_1.length; _b++) {
                    pair = others_1[_b];
                    promiseReserveOthers.push(pair.getReserves());
                }
                reserveOthers = [];
                _g.label = 2;
            case 2:
                _g.trys.push([2, 7, 8, 13]);
                promiseReserveOthers_1 = __asyncValues(promiseReserveOthers);
                _g.label = 3;
            case 3: return [4, promiseReserveOthers_1.next()];
            case 4:
                if (!(promiseReserveOthers_1_1 = _g.sent(), !promiseReserveOthers_1_1.done)) return [3, 6];
                reserves = promiseReserveOthers_1_1.value;
                reserveOthers.push({ r0: reserves[0], r1: reserves[1] });
                _g.label = 5;
            case 5: return [3, 3];
            case 6: return [3, 13];
            case 7:
                e_1_1 = _g.sent();
                e_1 = { error: e_1_1 };
                return [3, 13];
            case 8:
                _g.trys.push([8, , 11, 12]);
                if (!(promiseReserveOthers_1_1 && !promiseReserveOthers_1_1.done && (_f = promiseReserveOthers_1["return"]))) return [3, 10];
                return [4, _f.call(promiseReserveOthers_1)];
            case 9:
                _g.sent();
                _g.label = 10;
            case 10: return [3, 12];
            case 11:
                if (e_1) throw e_1.error;
                return [7];
            case 12: return [7];
            case 13:
                table = [];
                i = 0, diff = ethers_1.BigNumber.from('0');
                for (_c = 0, reserveOthers_1 = reserveOthers; _c < reserveOthers_1.length; _c++) {
                    reserve = reserveOthers_1[_c];
                    j = -1;
                    for (_d = 0, amountsPayback_1 = amountsPayback; _d < amountsPayback_1.length; _d++) {
                        amountPayback = amountsPayback_1[_d];
                        j++;
                        if (reserve.r1.lt(amountPayback))
                            continue;
                        amountIn = percents[j], amountInWithFee = amountIn.mul(997), numerator = amountInWithFee.mul(reserve.r1), denominator = reserve.r0.mul(1000).add(amountInWithFee), amountOut = numerator.div(denominator), gt = amountOut.gt(amountPayback);
                        if (gt) {
                            diff2 = amountOut.sub(amountPayback);
                            if (diff2.gt(diff)) {
                                diff = diff2;
                                lastSuccessBigCall_1 = {
                                    amountIn: amountIn,
                                    pair1: others[i],
                                    diff: diff
                                };
                            }
                            COUNTER_SUCCESS++;
                            table.push((_e = {
                                    '#': percentsToNumber[j] + "%"
                                },
                                _e[token0.symbol + "_BORROW"] = ethers_1.utils.formatUnits(amountIn, token0.decimals),
                                _e.BLOCKNUMBER = BLOCKNUMBER,
                                _e.Sell = utils_1.getNameExchange(others[i].address),
                                _e[token1.symbol] = ethers_1.utils.formatUnits(amountOut, token1.decimals),
                                _e[token1.symbol + "_PAYBACK"] = ethers_1.utils.formatUnits(amountPayback, token1.decimals),
                                _e['Call?'] = gt,
                                _e));
                        }
                        else
                            COUNTER_FAIL++;
                    }
                    table.push({});
                    i++;
                }
                if (typeof lastSuccessBigCall_1 != 'undefined') {
                    LOCK_ON_SYNC = true;
                    console.log("flashswap " + ethers_1.utils.formatUnits(lastSuccessBigCall_1.diff, token1.decimals) + " " + token1.symbol);
                    console.table(table);
                    IMMEDIATE_IDS.push(setImmediate(function () {
                        callFlashswap(lastSuccessBigCall_1.amountIn, pc_1, lastSuccessBigCall_1.pair1);
                    }));
                }
                COUNTER++;
                console.log(utils_1.getNameExchange(pc_1.address) + " " + token0.symbol + "/" + token1.symbol);
                console.log(event.blockNumber + " : computed in " + (Date.now() - t0) / 1000 + " seconds");
                console.log(event.blockNumber + " : diff sync " + time + " seconds\n");
                return [3, 15];
            case 14:
                error_1 = _g.sent();
                makeError(error_1, '### onSync ###');
                return [3, 15];
            case 15: return [2];
        }
    });
}); };
var callFlashswap = function (amountIn, pair, pair2) { return __awaiter(void 0, void 0, void 0, function () {
    var router, flash, deadline, tx, receipt, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                router = utils_1.getRouterContractFromPairAddress(pair2.address);
                if (typeof router === 'undefined') {
                }
                flash = ethers_1.utils.defaultAbiCoder.encode(['FlashData(uint256 amountBorrow, address pairBorrow, address routerSell)'], [{ amountBorrow: amountIn, pairBorrow: pair.address, routerSell: router.address }]), deadline = Math.floor(Date.now() / 1000) + 30;
                return [4, utils_1.raoContract.connect(utils_1.signer).callStatic.flashswap(flash, deadline, {
                        gasLimit: ethers_1.utils.parseUnits('2', 'mwei'),
                        gasPrice: ethers_1.utils.parseUnits('380', 'gwei')
                    })];
            case 1:
                tx = _a.sent();
                return [4, tx.wait(2)];
            case 2:
                receipt = _a.sent();
                LOCK_ON_SYNC = false;
                console.log(receipt);
                process.kill(process.pid, 'SIGINT');
                return [3, 4];
            case 3:
                error_2 = _a.sent();
                console.log(error_2);
                process.kill(process.pid, 'SIGINT');
                return [3, 4];
            case 4: return [2];
        }
    });
}); };
var dayjsFormat = function (seconds) {
    var hour = Math.floor(seconds / Math.pow(60, 2)), minute = Math.floor(seconds / 60) % 60, second = seconds % 60;
    return hour + ":" + minute + ":" + second;
};
var pid = process.pid, date_launched = dayjs_1["default"]();
var logs = function () {
    var now = dayjs_1["default"]();
    console.table({
        PID: pid,
        'Started at': date_launched.format('D/M/YYYY H:m:s'),
        'Live date': now.format('D/M/YYYY H:m:s'),
        Running: dayjsFormat(now.diff(date_launched, 'seconds')),
        COUNTER: COUNTER,
        COUNTER_CALL: COUNTER_CALL,
        COUNTER_SUCCESS: COUNTER_SUCCESS,
        COUNTER_FAIL: COUNTER_FAIL
    });
};
var FLASHSWAPS = [];
var app = function () { return __awaiter(void 0, void 0, void 0, function () {
    var tokenA, tokenB, tokenC, tokenD, tokens, i, _i, tokens_1, t0, j, _a, tokens_2, t1, flashswap, error_3, _b, FLASHSWAPS_1, flashswap, _c, error_4;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 14, , 15]);
                tokenA = utils_1.getToken('WMATIC'), tokenB = utils_1.getToken('WBTC'), tokenC = utils_1.getToken('WETH'), tokenD = utils_1.getToken('USDC');
                tokens = [tokenA, tokenB, tokenC, tokenD];
                console.log("Create instances for " + tokens.length + " tokens");
                i = 0;
                _i = 0, tokens_1 = tokens;
                _d.label = 1;
            case 1:
                if (!(_i < tokens_1.length)) return [3, 9];
                t0 = tokens_1[_i];
                j = -1;
                _a = 0, tokens_2 = tokens;
                _d.label = 2;
            case 2:
                if (!(_a < tokens_2.length)) return [3, 7];
                t1 = tokens_2[_a];
                j++;
                if (i >= j)
                    return [3, 6];
                flashswap = new flashswap_1["default"](t0, t1);
                _d.label = 3;
            case 3:
                _d.trys.push([3, 5, , 6]);
                console.log("\tflashswap[" + j + "] " + t0.symbol + "/" + t1.symbol);
                return [4, flashswap.initialize()];
            case 4:
                _d.sent();
                FLASHSWAPS.push(flashswap);
                return [3, 6];
            case 5:
                error_3 = _d.sent();
                console.log("error instanciated " + t0.symbol + "/" + t1.symbol);
                throw error_3;
            case 6:
                _a++;
                return [3, 2];
            case 7:
                i++;
                _d.label = 8;
            case 8:
                _i++;
                return [3, 1];
            case 9:
                console.log("Created " + FLASHSWAPS.length + " instances\nCreate listeners");
                i = 0;
                _b = 0, FLASHSWAPS_1 = FLASHSWAPS;
                _d.label = 10;
            case 10:
                if (!(_b < FLASHSWAPS_1.length)) return [3, 13];
                flashswap = FLASHSWAPS_1[_b];
                _c = i;
                return [4, flashswap.onSync(onSync)];
            case 11:
                i = _c + _d.sent();
                _d.label = 12;
            case 12:
                _b++;
                return [3, 10];
            case 13:
                console.log("Created " + i + " listeners");
                LOCK_ON_SYNC = false;
                INTERVAL_IDS.push(setInterval(logs, 1e3 * 45));
                return [3, 15];
            case 14:
                error_4 = _d.sent();
                makeError(error_4, '### app ###');
                return [3, 15];
            case 15: return [2];
        }
    });
}); };
var INTERVAL_IDS = [], IMMEDIATE_IDS = [];
var makeError = function (error, capsule) {
    LOCK_ON_SYNC = true;
    var ln = FLASHSWAPS.length;
    for (var index = 0; index < ln; index++) {
        FLASHSWAPS.shift();
    }
    ln = INTERVAL_IDS.length;
    for (var index = 0; index < ln; index++) {
        clearInterval(INTERVAL_IDS[0]);
        INTERVAL_IDS.shift();
    }
    ln = IMMEDIATE_IDS.length;
    for (var index = 0; index < ln; index++) {
        clearImmediate(IMMEDIATE_IDS[0]);
        IMMEDIATE_IDS.shift();
    }
    console.error(capsule || '###');
    console.error(error);
    console.error(capsule || '###');
    if (error && error.code && error.code == utils_2.Logger.errors.TIMEOUT) {
        utils_1.switchInfuraProvider();
        console.log("Restart main");
        main();
    }
};
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_5;
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
                error_5 = _a.sent();
                makeError(error_5);
                return [3, 4];
            case 4: return [2];
        }
    });
}); };
var LOCK_CLOSE = false;
var close = function () {
    if (LOCK_CLOSE)
        return;
    LOCK_CLOSE = true;
    console.log("\nexit///");
    logs();
    process.exit();
};
process.on('exit', close);
process.on('SIGINT', close);
process.on('SIGTERM', close);
main();
