import mime from 'mime-types';
import accepts, { Accepts } from 'accepts';
import { IRequest, AnyObject } from '@rheas/contracts';
import { IAttributeManager, IRequestContent } from '@rheas/contracts/core';

export class RequestContent implements IAttributeManager {
    /**
     * The request itself whose contents has to be managed.
     *
     * @var string
     */
    protected _request: IRequest;

    /**
     * The accept instance that has to be used for negotiations.
     *
     * @var Accepts
     */
    protected _negotiator: Accepts | null = null;

    /**
     * Stores request attributes. Attributes are how new fields are
     * entered into request.
     *
     * @var AnyObject
     */
    protected _attributes: AnyObject = {};

    /**
     * The format in which response has to be sent.
     *
     * @var string
     */
    protected _format: string | null = null;

    /**
     *
     * @param request
     */
    constructor(request: IRequest) {
        this._request = request;
    }

    /**
     * Returns true if the request is an AJAX request.
     *
     * @returns
     */
    public ajax(): boolean {
        return 'XMLHttpRequest' === this._request.headers['X-Requested-With'];
    }

    /**
     * Returns true if the request is a PJAX request.
     *
     * @returns
     */
    public pjax(): boolean {
        return 'true' === this._request.headers['X-PJAX'];
    }

    /**
     * Returns true if the request accepts the given type.
     *
     * @param type
     */
    public accepts(type: string): boolean {
        return false !== this.negotiator().type(type);
    }

    /**
     * Returns true if the request conten-type is a json
     *
     * @returns
     */
    public isJson(): boolean {
        const content_type = this._request.headers['content-type'];

        if (content_type) {
            return content_type.includes('/json') || content_type.includes('+json');
        }
        return false;
    }

    /**
     * Returns true if the request accepts json
     *
     * @returns
     */
    public acceptsJson(): boolean {
        return (this.ajax() && !this.pjax() && this.acceptsAnyType()) || this.wantsJson();
    }

    /**
     * Returns true if the request is specifically asking for json. Mimetype for
     * json content is either
     *
     * [1] application/json
     * [2] application/problem+json
     *
     * We will check for the presence of "/json" and "+json" strings. We use the string
     * check as the negotiator might return true even if the client is not requesting
     * for it but accepts any type "*"
     *
     * @returns
     */
    public wantsJson(): boolean {
        const types = this.acceptableContentTypes();

        if (types.length > 0) {
            return types[0].includes('/json') || types[0].includes('+json');
        }
        return false;
    }

    /**
     * Returns true if the request accepts any content type
     *
     * @returns
     */
    public acceptsAnyType(): boolean {
        const types = this.acceptableContentTypes();

        return types.includes('*/*') || types.includes('*');
    }

    /**
     * Returns the acceptable content types in the quality order.
     * Most preferred are returned first.
     *
     * @returns
     */
    public acceptableContentTypes(): string[] {
        return this.negotiator().types() as string[];
    }

    /**
     * Returns the negotiator instance.
     *
     * @returns
     */
    public negotiator(): Accepts {
        if (this._negotiator === null) {
            this._negotiator = accepts(this._request);
        }
        return this._negotiator;
    }

    /**
     * Returns the mimetype of the format. null if no mime found.
     *
     * @param format
     * @return
     */
    public getMimeType(format: string): string | null {
        return mime.lookup(format) || null;
    }

    /**
     * Sets the format in which response has to be send.
     *
     * @param format
     */
    public setFormat(format: string): IRequestContent {
        this._format = format;

        return this;
    }

    /**
     * Gets the request format set by the application. Setting a custom format
     * to the request overrides the accept header.
     *
     * For instance, if accept header allows both html and json and the server
     * want to send json, application can set "json" as the request format and
     * the response will have json content-type.
     *
     * @returns string
     */
    public getFormat(defaulValue: string = 'html'): string {
        if (null == this._format) {
            this._format = this.getAttribute('_format');
        }

        return null == this._format ? defaulValue : this._format;
    }

    /**
     * Sets an attribute value. This enables setting custom values on request
     * that are not actually present in the incoming request.
     *
     * @param key
     * @param value
     */
    public setAttribute(key: string, value: any): IAttributeManager {
        this._attributes[key] = value;

        return this;
    }

    /**
     * Gets an attribute value if it exists or the defaultValue or null if no
     * default is given.
     *
     * @param key
     * @param defaultValue
     */
    public getAttribute(key: string, defaultValue: any = null) {
        if (this._attributes.hasOwnProperties(key)) {
            return this._attributes[key];
        }
        return defaultValue;
    }
}
