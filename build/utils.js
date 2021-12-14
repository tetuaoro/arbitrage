"use strict";
exports.__esModule = true;
exports.getToken = exports.THROW_NOT_FOUND_TOKEN = void 0;
var TOKENS = require("./tokens.json");
exports.THROW_NOT_FOUND_TOKEN = 'THROW_NOT_FOUND_TOKEN';
exports.getToken = function (symbol) {
    var token = TOKENS.find(function (t) { return t.symbol == symbol; });
    if (typeof token === 'undefined')
        throw new Error(exports.THROW_NOT_FOUND_TOKEN);
    return token;
};
