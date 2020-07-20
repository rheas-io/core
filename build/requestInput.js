"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var support_1 = require("@rheas/support");
var RequestInput = /** @class */ (function () {
    /**
     *
     * @param request
     */
    function RequestInput(request) {
        /**
         * All the request inputs
         *
         * @var AnyObject
         */
        this._inputs = {};
        this._request = request;
    }
    /**
     * Returns all the inputs as an object.
     *
     * @returns
     */
    RequestInput.prototype.all = function () {
        return this._inputs;
    };
    /**
     * Replaces the request inputs with the given argument
     *
     * @param newParams
     */
    RequestInput.prototype.merge = function (newParams) {
        this._inputs = Object.assign(this._inputs, newParams);
        return this;
    };
    /**
     * Returns the input value for the key.
     *
     * @param key
     * @param defaultValue
     */
    RequestInput.prototype.get = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        return support_1.Obj.get(this._inputs, key, defaultValue);
    };
    return RequestInput;
}());
exports.RequestInput = RequestInput;
