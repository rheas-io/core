import { Str } from "@rheas/support";
import { StringObject } from "@rheas/contracts";

export class Headers {

    /**
     * All the headers.
     * 
     * @var StringObject
     */
    protected _headers: StringObject = {};

    /**
     * Gets the header value of the key if it exists or returns the defaultValue. 
     * If no defaultValue is submitted null is returned.
     * 
     * @param key 
     * @param defaultValue 
     */
    public get(key: string, defaultValue: any = null): any {
        key = this.cleanKey(key);

        if (this._headers.hasOwnProperty(key)) {
            return this._headers[key];
        }
        return defaultValue;
    }

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
    public getDate(key: string, defaultValue: Date | null = null): Date | null {
        const date = this.get(key);

        if (null !== date) {
            // The milliseconds from epoch to the date, if it is a valid
            // date. Or returns NaN if invalid date format is used.
            const dateObject = Date.parse(date);

            if (dateObject !== NaN) {
                return new Date(dateObject);
            }
        }
        return defaultValue;
    }

    /**
     * Sets the header key to the given value.
     * 
     * If replace is set to false, already existing header won't be replaced.
     * Default is to change the header value even if it exists.
     * 
     * @param key 
     * @param value 
     */
    public set(key: string, value: string, replace: boolean = true) {
        key = this.cleanKey(key);

        if (replace === false && this.has(key)) {
            return;
        }
        this._headers[key] = value;
    }

    /**
     * Removes a header from the headerbag.
     * 
     * @param key 
     */
    public remove(key: string) {
        key = this.cleanKey(key);

        delete this._headers[key];
    }

    /**
     * Returns true if headers consists of particular key.
     * 
     * @param key 
     */
    public has(key: string): boolean {
        key = this.cleanKey(key);

        return this._headers.hasOwnProperty(key);
    }

    /**
     * Returns a clean header key. Header keys should replace _  with - and 
     * should be lower case just like the underlying http module.
     * 
     * @param key 
     */
    protected cleanKey(key: string): string {
        return Str.replace(key, '_', '-').toLowerCase();
    }
}