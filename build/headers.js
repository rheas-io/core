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
        /**
         * Stores all the cache-control properties.
         *
         * @var AnyObject
         */
        this._cacheControls = {};
        this._headers = headers;
    }
    /**
     * Returns true if the response has valid validation headers
     * like ETag or Last-Modified
     *
     * @returns
     */
    Headers.prototype.isValidateable = function () {
        return this.has('Last-Modified') || this.has('ETag');
    };
    /**
     * Returns true if the response is considered "fresh".
     *
     * A response is considered fresh if its lifetime is less than the
     * max-age or expires headers.
     *
     * @returns
     */
    Headers.prototype.isFresh = function () {
        var ttl = this.getTtl();
        return null !== ttl && ttl > 0;
    };
    /**
     * Returns this responses lifetime in seconds. Obtained from the Age of
     * the response and it's expiry time.
     *
     * If no expiry headers are set, then null is resturned.
     *
     * @returns
     */
    Headers.prototype.getTtl = function () {
        var maxAge = this.getMaxAge();
        return maxAge === null ? null : maxAge - this.getAge();
    };
    /**
     * Returns the max-age of this response from the expire/max-age headers.
     *
     * The returned value is in seconds ie, number of seconds from the age of
     * response after which the response is considered expired.
     *
     * @returns
     */
    Headers.prototype.getMaxAge = function () {
        var maxAge = null;
        maxAge = Number.parseInt(this.getCacheControl("s-maxage"));
        if (maxAge === NaN) {
            maxAge = Number.parseInt(this.getCacheControl("max-age"));
        }
        if (maxAge === NaN) {
            maxAge = this.getMaxAgeFromExpires();
        }
        return maxAge;
    };
    /**
     * Returns the age of the response in seconds.
     *
     * Age header value is returned if that is set, or age is determined
     * from the response date and current time.
     *
     * @returns
     */
    Headers.prototype.getAge = function () {
        var _a;
        var ageSeconds = this.get('Age');
        if (null !== ageSeconds) {
            return ageSeconds;
        }
        var responseDate = ((_a = this.getDate()) === null || _a === void 0 ? void 0 : _a.getTime()) || 0;
        return Math.max((Date.now() - responseDate), 0);
    };
    /**
     * Returns maxage in seconds from the expires header.
     *
     * Maxage is determined from the response data and the expires
     * header value ie, maxAge = expires - date. If expires is not set,
     * or date is not a valid date, null is returned.
     *
     * @returns
     */
    Headers.prototype.getMaxAgeFromExpires = function () {
        var expireTime = this.getExpires();
        if (expireTime !== null) {
            var date = this.getDate();
            if (date !== null) {
                return Math.round((expireTime - date.getTime()) / 0.001);
            }
        }
        return null;
    };
    /**
     * Returns the time in epoch milliseconds at which this response expires.
     * Calcuated from the Expires header, if available or returns a
     * time from the past.
     *
     * Returns null, if no Expires header is found.
     *
     * @returns
     */
    Headers.prototype.getExpires = function () {
        try {
            var expires = this.getDate("Expires");
            if (expires !== null) {
                return expires.getTime();
            }
        }
        catch (error) {
            return new Date(Date.now() - 86400).getTime();
        }
        return null;
    };
    /**
     * Removes the private cache-control and sets the public property.
     *
     * @returns
     */
    Headers.prototype.setPublic = function () {
        this.addCacheControl("public");
        this.removeCacheControl("private");
        return this;
    };
    /**
     * Removes the public cache property and sets the public property.
     *
     * @returns
     */
    Headers.prototype.setPrivate = function () {
        this.addCacheControl("private");
        this.removeCacheControl("public");
        return this;
    };
    /**
     * Sets the max-age property to the given number of seconds. The cache will
     * become expired after this many seconds from the request time.
     *
     * @param age
     */
    Headers.prototype.setMaxAge = function (age) {
        this.addCacheControl('max-age', age.toString());
        return this;
    };
    /**
     * Sets the immutable property on the cache header. Not universally accepted
     * though. Cache with immutable property won't be send for validation and thereby
     * causing faster loads from browser caches.
     *
     * @param immutable
     * @returns
     */
    Headers.prototype.setImmutable = function (immutable) {
        if (immutable === void 0) { immutable = true; }
        if (immutable) {
            this.addCacheControl("immutable");
        }
        else {
            this.removeCacheControl("immutable");
        }
        return this;
    };
    /**
     * Returns true if the immutable property is set.
     *
     * @returns
     */
    Headers.prototype.isImmutable = function () {
        return this.hasCacheControl("immutable");
    };
    /**
     * Creates a cache control property. If no value is provided the property will have no value
     * part just like the privat/public properties. Property like max-age needs a value
     * part.
     *
     * @param key
     * @param value
     */
    Headers.prototype.addCacheControl = function (key, value) {
        if (value === void 0) { value = true; }
        this._cacheControls[key] = value;
        return this;
    };
    /**
     * Removes the cache-control by setting it to false. Keys with false
     * as value won't be added on the header.
     *
     * @param key
     */
    Headers.prototype.removeCacheControl = function (key) {
        this._cacheControls[key] = false;
        return this;
    };
    /**
     * Returns true if a cache-control property is set for the given key.
     * True only if a key is present and its value is not boolean false.
     *
     * @param key
     */
    Headers.prototype.hasCacheControl = function (key) {
        return this._cacheControls[key] !== undefined && this._cacheControls[key] !== false;
    };
    /**
     * Returns the cache-control property value if it exists or returns
     * the defaultValue. Mainly used for reading the max-age, s-maxage
     * properties.
     *
     * @param key
     */
    Headers.prototype.getCacheControl = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        if (this.hasCacheControl(key)) {
            return this._cacheControls[key];
        }
        return defaultValue;
    };
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
        if (key === void 0) { key = "Date"; }
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
