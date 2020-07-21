"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const support_1 = require("@rheas/support");
class RequestInput {
    /**
     *
     * @param request
     */
    constructor(request) {
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
    all() {
        return this._inputs;
    }
    /**
     * Replaces the request inputs with the given argument
     *
     * @param newParams
     */
    merge(newParams) {
        this._inputs = Object.assign(this._inputs, newParams);
        return this;
    }
    /**
     * Returns the input value for the key.
     *
     * @param key
     * @param defaultValue
     */
    get(key, defaultValue = null) {
        return support_1.Obj.get(this._inputs, key, defaultValue);
    }
}
exports.RequestInput = RequestInput;
