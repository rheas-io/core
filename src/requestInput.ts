import { Obj } from "@rheas/support";
import { IRequestInput } from "@rheas/contracts/core";
import { IRequest, AnyObject } from "@rheas/contracts";

export class RequestInput implements IRequestInput {

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
    protected _inputs: AnyObject = {};

    /**
     * 
     * @param request 
     */
    constructor(request: IRequest) {
        this._request = request;
    }

    /**
     * Returns all the inputs as an object.
     * 
     * @returns 
     */
    public all(): AnyObject {
        return this._inputs;
    }

    /**
     * Replaces the request inputs with the given argument
     * 
     * @param newParams 
     */
    public merge(newParams: AnyObject): IRequestInput {
        this._inputs = Object.assign(this._inputs, newParams);

        return this;
    }

    /**
     * Returns the input value for the key.
     * 
     * @param key 
     * @param defaultValue 
     */
    public get(key: string, defaultValue: any = null): any {
        return Obj.get(this._inputs, key, defaultValue);
    }
}