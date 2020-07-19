"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var headers_1 = require("./headers");
var CacheHeaders = /** @class */ (function () {
    /**
     * Creates a cache manager for req/res headers. This manager acts as a
     * cache setter for response and getter for the requests.
     *
     * All cache related operations like setting cache-controls, reading the
     * freshness of the response, ttl, age etc are handled in here.
     *
     * All cache related http header setters are also managed by this class.
     */
    function CacheHeaders() {
        /**
         * Stores all the cache-control properties.
         *
         * @var AnyObject
         */
        this._cacheControls = {};
        this._headers = new headers_1.Headers();
    }
    /**
     * Returns true if the response is considered "fresh".
     *
     * A response is considered fresh if its lifetime is less than the
     * max-age or expires headers.
     *
     * @returns
     */
    CacheHeaders.prototype.isFresh = function () {
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
    CacheHeaders.prototype.getTtl = function () {
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
    CacheHeaders.prototype.getMaxAge = function () {
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
    CacheHeaders.prototype.getAge = function () {
        var _a;
        var ageSeconds = this._headers.get('Age');
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
    CacheHeaders.prototype.getMaxAgeFromExpires = function () {
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
    CacheHeaders.prototype.getExpires = function () {
        try {
            var expires = this._headers.getDate("Expires");
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
     * Returns the value of Date header of this response.
     *
     * @returns
     */
    CacheHeaders.prototype.getDate = function () {
        return this._headers.getDate('Date');
    };
    /**
     * Removes the private cache-control and sets the public property.
     *
     * @returns
     */
    CacheHeaders.prototype.setPublic = function () {
        this.addCacheControl("public");
        this.removeCacheControl("private");
        return this;
    };
    /**
     * Removes the public cache property and sets the public property.
     *
     * @returns
     */
    CacheHeaders.prototype.setPrivate = function () {
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
    CacheHeaders.prototype.setMaxAge = function (age) {
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
    CacheHeaders.prototype.setImmutable = function (immutable) {
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
    CacheHeaders.prototype.isImmutable = function () {
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
    CacheHeaders.prototype.addCacheControl = function (key, value) {
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
    CacheHeaders.prototype.removeCacheControl = function (key) {
        this._cacheControls[key] = false;
        return this;
    };
    /**
     * Returns true if a cache-control property is set for the given key.
     * True only if a key is present and its value is not boolean false.
     *
     * @param key
     */
    CacheHeaders.prototype.hasCacheControl = function (key) {
        return this._cacheControls[key] !== undefined && this._cacheControls[key] !== false;
    };
    /**
     * Returns the cache-control property value if it exists or returns
     * the defaultValue. Mainly used for reading the max-age, s-maxage
     * properties.
     *
     * @param key
     */
    CacheHeaders.prototype.getCacheControl = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        if (this.hasCacheControl(key)) {
            return this._cacheControls[key];
        }
        return defaultValue;
    };
    return CacheHeaders;
}());
exports.CacheHeaders = CacheHeaders;
