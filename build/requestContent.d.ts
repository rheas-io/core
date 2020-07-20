import { Accepts } from "accepts";
import { IRequest, AnyObject } from "@rheas/contracts";
import { IAttributeManager, IRequestContent } from "@rheas/contracts/core";
export declare class RequestContent implements IAttributeManager {
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
    protected _negotiator: Accepts | null;
    /**
     * Stores request attributes. Attributes are how new fields are
     * entered into request.
     *
     * @var AnyObject
     */
    protected _attributes: AnyObject;
    /**
     * The format in which response has to be sent.
     *
     * @var string
     */
    protected _format: string | null;
    /**
     *
     * @param request
     */
    constructor(request: IRequest);
    /**
     * Returns true if the request is an AJAX request.
     *
     * @returns
     */
    ajax(): boolean;
    /**
     * Returns true if the request is a PJAX request.
     *
     * @returns
     */
    pjax(): boolean;
    /**
     * Returns true if the request accepts the given type.
     *
     * @param type
     */
    accepts(type: string): boolean;
    /**
     * Returns true if the request accepts json
     *
     * @returns
     */
    acceptsJson(): boolean;
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
    wantsJson(): boolean;
    /**
     * Returns true if the request accepts any content type
     *
     * @returns
     */
    acceptsAnyType(): boolean;
    /**
     * Returns the acceptable content types in the quality order.
     * Most preferred are returned first.
     *
     * @returns
     */
    acceptableContentTypes(): string[];
    /**
     * Returns true if the request conten-type is a json
     *
     * @returns
     */
    isJson(): boolean;
    /**
     * Returns the negotiator instance.
     *
     * @returns
     */
    negotiator(): Accepts;
    /**
     * Returns the mimetype of the format. null if no mime found.
     *
     * @param format
     * @return
     */
    getMimeType(format: string): string | null;
    /**
     * Sets the format in which response has to be send.
     *
     * @param format
     */
    setFormat(format: string): IRequestContent;
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
    getFormat(defaulValue?: string): string;
    /**
     * Sets an attribute value. This enables setting custom values on request
     * that are not actually present in the incoming request.
     *
     * @param key
     * @param value
     */
    setAttribute(key: string, value: any): IAttributeManager;
    /**
     * Gets an attribute value if it exists or the defaultValue or null if no
     * default is given.
     *
     * @param key
     * @param defaultValue
     */
    getAttribute(key: string, defaultValue?: any): any;
}
