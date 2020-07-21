"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var support_1 = require("@rheas/support");
var Headers = /** @class */ (function () {
    /**
     * Creates a new header class that operates on request and
     * response headers. The argument passed in is the NodeJS
     * message.headers property
     *
     * @param headers
     */
    function Headers(headers) {
        if (headers === void 0) { headers = {}; }
        this._headers = headers;
    }
    /**
     * Gets the header value of the key if it exists or returns the defaultValue.
     * If no defaultValue is submitted null is returned.
     *
     * @param key
     * @param defaultValue
     */
    Headers.prototype.get = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        key = this.cleanKey(key);
        if (this._headers.hasOwnProperty(key)) {
            return this._headers[key];
        }
        return defaultValue;
    };
    /**
     * Returns a date object if a date header is present and its value is a
     * parsable date string.
     *
     * DefaultValue is returned if no header is found or if the value held is
     * not a valid date.
     *
     * @param key
     * @param defaultValue
     */
    Headers.prototype.getDate = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        var date = this.get(key);
        if (null !== date) {
            // The milliseconds from epoch to the date, if it is a valid
            // date. Or returns NaN if invalid date format is used.
            var dateObject = Date.parse(date);
            if (dateObject !== NaN) {
                return new Date(dateObject);
            }
        }
        return defaultValue;
    };
    /**
     * Sets the header key to the given value.
     *
     * If replace is set to false, already existing header won't be replaced.
     * Default is to change the header value even if it exists.
     *
     * @param key
     * @param value
     */
    Headers.prototype.set = function (key, value, replace) {
        if (replace === void 0) { replace = true; }
        key = this.cleanKey(key);
        if (replace === false && this.has(key)) {
            return;
        }
        this._headers[key] = value;
    };
    /**
     * Removes a header from the headerbag.
     *
     * @param key
     */
    Headers.prototype.remove = function (key) {
        key = this.cleanKey(key);
        delete this._headers[key];
    };
    /**
     * Returns true if headers consists of particular key.
     *
     * @param key
     */
    Headers.prototype.has = function (key) {
        key = this.cleanKey(key);
        return this._headers.hasOwnProperty(key);
    };
    /**
     * Returns a clean header key. Header keys should replace _  with - and
     * should be lower case just like the underlying http module.
     *
     * @param key
     */
    Headers.prototype.cleanKey = function (key) {
        return support_1.Str.replace(key, '_', '-').toLowerCase();
    };
    return Headers;
}());
exports.Headers = Headers;
