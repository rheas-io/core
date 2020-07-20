import { IRequestInput } from "@rheas/contracts/core";
import { IRequest, AnyObject } from "@rheas/contracts";
export declare class RequestInput implements IRequestInput {
    /**
     * The request whose inputs has to managed.
     *
     * @var IRequest
     */
    protected _request: IRequest;
    /**
     * All the request inputs
     *
     * @var AnyObject
     */
    protected _inputs: AnyObject;
    /**
     *
     * @param request
     */
    constructor(request: IRequest);
    /**
     * Returns all the inputs as an object.
     *
     * @returns
     */
    all(): AnyObject;
    /**
     * Replaces the request inputs with the given argument
     *
     * @param newParams
     */
    merge(newParams: AnyObject): IRequestInput;
    /**
     * Returns the input value for the key.
     *
     * @param key
     * @param defaultValue
     */
    get(key: string, defaultValue?: any): any;
}
