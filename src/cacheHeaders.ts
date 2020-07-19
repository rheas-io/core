import { Headers } from "./headers";
import { AnyObject } from "@rheas/contracts";
import { ICacheManager } from "@rheas/contracts/core";

export class CacheHeaders implements ICacheManager{

    /**
     * Stores cache related headers.
     * 
     * @var Headers
     */
    protected _headers: Headers;

    /**
     * Stores all the cache-control properties.
     * 
     * @var AnyObject
     */
    protected _cacheControls: AnyObject = {};

    /**
     * Creates a cache manager for req/res headers. This manager acts as a
     * cache setter for response and getter for the requests. 
     * 
     * All cache related operations like setting cache-controls, reading the 
     * freshness of the response, ttl, age etc are handled in here.
     * 
     * All cache related http header setters are also managed by this class.
     */
    constructor() {
        this._headers = new Headers();
    }

    /**
     * Returns true if the response is considered "fresh".
     * 
     * A response is considered fresh if its lifetime is less than the 
     * max-age or expires headers.
     * 
     * @returns
     */
    public isFresh(): boolean {
        const ttl = this.getTtl();

        return null !== ttl && ttl > 0;
    }

    /**
     * Returns this responses lifetime in seconds. Obtained from the Age of
     * the response and it's expiry time. 
     * 
     * If no expiry headers are set, then null is resturned.
     * 
     * @returns
     */
    public getTtl(): number | null {
        const maxAge = this.getMaxAge();

        return maxAge === null ? null : maxAge - this.getAge();
    }

    /**
     * Returns the max-age of this response from the expire/max-age headers. 
     * 
     * The returned value is in seconds ie, number of seconds from the age of
     * response after which the response is considered expired.
     * 
     * @returns
     */
    public getMaxAge(): number | null {
        let maxAge = null;

        maxAge = Number.parseInt(this.getCacheControl("s-maxage"));

        if (maxAge === NaN) {
            maxAge = Number.parseInt(this.getCacheControl("max-age"));
        }

        if (maxAge === NaN) {
            maxAge = this.getMaxAgeFromExpires();
        }
        return maxAge;
    }

    /**
     * Returns the age of the response in seconds. 
     * 
     * Age header value is returned if that is set, or age is determined 
     * from the response date and current time.
     * 
     * @returns
     */
    public getAge(): number {
        const ageSeconds = this._headers.get('Age');

        if (null !== ageSeconds) {
            return ageSeconds;
        }
        const responseDate = (this.getDate()?.getTime()) || 0;

        return Math.max((Date.now() - responseDate), 0)
    }

    /**
     * Returns maxage in seconds from the expires header.
     * 
     * Maxage is determined from the response data and the expires 
     * header value ie, maxAge = expires - date. If expires is not set,
     * or date is not a valid date, null is returned.
     * 
     * @returns
     */
    public getMaxAgeFromExpires(): number | null {

        const expireTime = this.getExpires();

        if (expireTime !== null) {
            const date = this.getDate();

            if (date !== null) {
                return Math.round((expireTime - date.getTime()) / 0.001);
            }
        }
        return null;
    }

    /**
     * Returns the time in epoch milliseconds at which this response expires. 
     * Calcuated from the Expires header, if available or returns a 
     * time from the past.
     * 
     * Returns null, if no Expires header is found.
     * 
     * @returns
     */
    public getExpires(): number | null {
        try {
            const expires = this._headers.getDate("Expires");

            if (expires !== null) {
                return expires.getTime();
            }
        } catch (error) {
            return new Date(Date.now() - 86400).getTime();
        }
        return null;
    }

    /**
     * Returns the value of Date header of this response.
     * 
     * @returns
     */
    public getDate(): Date | null {
        return this._headers.getDate('Date');
    }

    /**
     * Removes the private cache-control and sets the public property.
     * 
     * @returns
     */
    public setPublic() {
        this.addCacheControl("public");
        this.removeCacheControl("private");

        return this;
    }

    /**
     * Removes the public cache property and sets the public property.
     * 
     * @returns
     */
    public setPrivate() {
        this.addCacheControl("private");
        this.removeCacheControl("public");

        return this;
    }

    /**
     * Sets the max-age property to the given number of seconds. The cache will
     * become expired after this many seconds from the request time.
     * 
     * @param age 
     */
    public setMaxAge(age: number) {
        this.addCacheControl('max-age', age.toString());

        return this;
    }

    /**
     * Sets the immutable property on the cache header. Not universally accepted 
     * though. Cache with immutable property won't be send for validation and thereby
     * causing faster loads from browser caches.
     * 
     * @param immutable
     * @returns
     */
    public setImmutable(immutable: boolean = true) {
        if (immutable) {
            this.addCacheControl("immutable");
        } else {
            this.removeCacheControl("immutable");
        }

        return this;
    }

    /**
     * Returns true if the immutable property is set.
     * 
     * @returns
     */
    public isImmutable(): boolean {
        return this.hasCacheControl("immutable");
    }

    /**
     * Creates a cache control property. If no value is provided the property will have no value
     * part just like the privat/public properties. Property like max-age needs a value 
     * part.
     * 
     * @param key 
     * @param value 
     */
    public addCacheControl(key: string, value: string | boolean = true) {
        this._cacheControls[key] = value;

        return this;
    }

    /**
     * Removes the cache-control by setting it to false. Keys with false
     * as value won't be added on the header.
     * 
     * @param key 
     */
    public removeCacheControl(key: string) {
        this._cacheControls[key] = false;

        return this;
    }

    /**
     * Returns true if a cache-control property is set for the given key. 
     * True only if a key is present and its value is not boolean false. 
     * 
     * @param key 
     */
    public hasCacheControl(key: string): boolean {
        return this._cacheControls[key] !== undefined && this._cacheControls[key] !== false;
    }

    /**
     * Returns the cache-control property value if it exists or returns
     * the defaultValue. Mainly used for reading the max-age, s-maxage 
     * properties.
     * 
     * @param key 
     */
    public getCacheControl(key: string, defaultValue: any = null): string {

        if (this.hasCacheControl(key)) {
            return this._cacheControls[key];
        }
        return defaultValue;
    }
}