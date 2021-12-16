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
var ethers_1 = require("ethers");
var utils_1 = require("./utils");
var Flashswap = (function () {
    function Flashswap(token0, token1) {
        this._token0 = token0;
        this._token1 = token1;
        this._provider = utils_1.provider;
        this._factory = utils_1.FACTORIES;
        this._routers = utils_1.ROUTERS;
        this._pairs = [];
    }
    Flashswap.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var i, switchTokens, _i, _a, fc, pair, token0, temp, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        i = 0, switchTokens = false;
                        _i = 0, _a = this._factory;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3, 5];
                        fc = _a[_i];
                        return [4, fc.getPair(this._token0.address, this._token1.address)];
                    case 2:
                        pair = _b.sent();
                        utils_1.required(!utils_1.eqAddress(ethers_1.constants.AddressZero, pair), Flashswap.THROW_NOT_AN_ADDRESS + " #AddressZero");
                        this._pairs.push(utils_1.pairContract.attach(pair));
                        utils_1.EXCHANGE_INFOS[i].pair.push(pair);
                        i++;
                        if (switchTokens)
                            return [3, 4];
                        switchTokens = true;
                        return [4, this._pairs[this._pairs.length - 1].token0()];
                    case 3:
                        token0 = _b.sent();
                        if (!utils_1.eqAddress(this._token0.address, token0)) {
                            temp = this._token0;
                            this._token0 = this._token1;
                            this._token1 = temp;
                        }
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3, 1];
                    case 5: return [3, 7];
                    case 6:
                        error_1 = _b.sent();
                        throw error_1;
                    case 7: return [2];
                }
            });
        });
    };
    Flashswap.prototype.getPairs = function () {
        return this._pairs;
    };
    Flashswap.prototype.onSync = function (fn) {
        return __awaiter(this, void 0, void 0, function () {
            var kLasts, _pairs, _i, _a, pair, kLast, myAvg, i, _b, kLasts_1, kLast, listenerInstanciated, _loop_1, this_1, _c, _pairs_1, pair;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        kLasts = [], _pairs = [];
                        _i = 0, _a = this._pairs;
                        _d.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3, 4];
                        pair = _a[_i];
                        return [4, pair.kLast()];
                    case 2:
                        kLast = _d.sent();
                        kLasts.push(kLast);
                        _d.label = 3;
                    case 3:
                        _i++;
                        return [3, 1];
                    case 4:
                        myAvg = kLasts
                            .reduce(function (a, b) { return a.add(b); })
                            .div(kLasts.length)
                            .div(1000), i = 0;
                        for (_b = 0, kLasts_1 = kLasts; _b < kLasts_1.length; _b++) {
                            kLast = kLasts_1[_b];
                            if (kLast.gt(myAvg))
                                _pairs.push(this._pairs[i]);
                            i++;
                        }
                        listenerInstanciated = 0;
                        _loop_1 = function (pair) {
                            if (_pairs.length == 1)
                                return "continue";
                            listenerInstanciated++;
                            var infos = {
                                token0: this_1._token0,
                                token1: this_1._token1,
                                pair: pair,
                                pairs: _pairs.filter(function (pc) { return !utils_1.eqAddress(pc.address, pair.address); })
                            };
                            pair.on('Sync', function (reserve0, reserve1, event) {
                                try {
                                    fn(infos, reserve0, reserve1, event);
                                }
                                catch (error) {
                                    throw error;
                                }
                            });
                        };
                        this_1 = this;
                        for (_c = 0, _pairs_1 = _pairs; _c < _pairs_1.length; _c++) {
                            pair = _pairs_1[_c];
                            _loop_1(pair);
                        }
                        return [2, listenerInstanciated];
                }
            });
        });
    };
    Flashswap.removeAllListeners = function () {
        utils_1.provider.removeAllListeners();
    };
    Flashswap.getNameExchange = function (address) {
        var exchange = address.slice(0, 8);
        for (var _i = 0, EXCHANGE_INFOS_1 = utils_1.EXCHANGE_INFOS; _i < EXCHANGE_INFOS_1.length; _i++) {
            var ex = EXCHANGE_INFOS_1[_i];
            if (typeof ex.pair.find(function (p) { return utils_1.eqAddress(p, address); }) != 'undefined') {
                exchange = ex.name;
                break;
            }
        }
        return exchange;
    };
    Flashswap.THROW_NOT_AN_ADDRESS = 'Flashswap: THROW_NOT_AN_ADDRESS';
    Flashswap.THROW_NO_FACTORIES = 'Flashswap: THROW_NO_FACTORIES';
    return Flashswap;
}());
exports["default"] = Flashswap;
