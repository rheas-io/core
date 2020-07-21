import { AnyObject } from "@rheas/contracts";
import { IHeaders, ICacheManager } from "@rheas/contracts/core";
export declare class Headers implements IHeaders, ICacheManager {
    /**
     * All the headers.
     *
     * @var AnyObject
     */
    protected _headers: AnyObject;
    /**
     * Stores all the cache-control properties.
     *
     * @var AnyObject
     */
    protected _cacheControls: AnyObject;
    /**
     * Creates a new header class that operates on request and
     * response headers. The argument passed in is the NodeJS
     * message.headers property
     *
     * @param headers
     */
    constructor(headers?: AnyObject);
    /**
     * Returns true if the response has valid validation headers
     * like ETag or Last-Modified
     *
     * @returns
     */
    isValidateable(): boolean;
    /**
     * Returns true if the response is considered "fresh".
     *
     * A response is considered fresh if its lifetime is less than the
     * max-age or expires headers.
     *
     * @returns
     */
    isFresh(): boolean;
    /**
     * Returns this responses lifetime in seconds. Obtained from the Age of
     * the response and it's expiry time.
     *
     * If no expiry headers are set, then null is resturned.
     *
     * @returns
     */
    getTtl(): number | null;
    /**
     * Returns the max-age of this response from the expire/max-age headers.
     *
     * The returned value is in seconds ie, number of seconds from the age of
     * response after which the response is considered expired.
     *
     * @returns
     */
    getMaxAge(): number | null;
    /**
     * Returns the age of the response in seconds.
     *
     * Age header value is returned if that is set, or age is determined
     * from the response date and current time.
     *
     * @returns
     */
    getAge(): number;
    /**
     * Returns maxage in seconds from the expires header.
     *
     * Maxage is determined from the response data and the expires
     * header value ie, maxAge = expires - date. If expires is not set,
     * or date is not a valid date, null is returned.
     *
     * @returns
     */
    getMaxAgeFromExpires(): number | null;
    /**
     * Returns the time in epoch milliseconds at which this response expires.
     * Calcuated from the Expires header, if available or returns a
     * time from the past.
     *
     * Returns null, if no Expires header is found.
     *
     * @returns
     */
    getExpires(): number | null;
    /**
     * Removes the private cache-control and sets the public property.
     *
     * @returns
     */
    setPublic(): this;
    /**
     * Removes the public cache property and sets the public property.
     *
     * @returns
     */
    setPrivate(): this;
    /**
     * Sets the max-age property to the given number of seconds. The cache will
     * become expired after this many seconds from the request time.
     *
     * @param age
     */
    setMaxAge(age: number): this;
    /**
     * Sets the immutable property on the cache header. Not universally accepted
     * though. Cache with immutable property won't be send for validation and thereby
     * causing faster loads from browser caches.
     *
     * @param immutable
     * @returns
     */
    setImmutable(immutable?: boolean): this;
    /**
     * Returns true if the immutable property is set.
     *
     * @returns
     */
    isImmutable(): boolean;
    /**
     * Creates a cache control property. If no value is provided the property will have no value
     * part just like the privat/public properties. Property like max-age needs a value
     * part.
     *
     * @param key
     * @param value
     */
    addCacheControl(key: string, value?: string | boolean): this;
    /**
     * Removes the cache-control by setting it to false. Keys with false
     * as value won't be added on the header.
     *
     * @param key
     */
    removeCacheControl(key: string): this;
    /**
     * Returns true if a cache-control property is set for the given key.
     * True only if a key is present and its value is not boolean false.
     *
     * @param key
     */
    hasCacheControl(key: string): boolean;
    /**
     * Returns the cache-control property value if it exists or returns
     * the defaultValue. Mainly used for reading the max-age, s-maxage
     * properties.
     *
     * @param key
     */
    getCacheControl(key: string, defaultValue?: any): string;
    /**
     * Gets the header value of the key if it exists or returns the defaultValue.
     * If no defaultValue is submitted null is returned.
     *
     * @param key
     * @param defaultValue
     */
    get(key: string, defaultValue?: any): any;
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
    getDate(key?: string, defaultValue?: Date | null): Date | null;
    /**
     * Sets the header key to the given value.
     *
     * If replace is set to false, already existing header won't be replaced.
     * Default is to change the header value even if it exists.
     *
     * @param key
     * @param value
     */
    set(key: string, value: string, replace?: boolean): void;
    /**
     * Removes a header from the headerbag.
     *
     * @param key
     */
    remove(key: string): void;
    /**
     * Returns true if headers consists of particular key.
     *
     * @param key
     */
    has(key: string): boolean;
    /**
     * Returns a clean header key. Header keys should replace _  with - and
     * should be lower case just like the underlying http module.
     *
     * @param key
     */
    protected cleanKey(key: string): string;
}
