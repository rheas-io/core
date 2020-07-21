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
     * Stores the input merges made by the application. This is kept
     * seperately from the input source, so that there is clear distinction
     * between incoming inputs and app inputs.
     *
     * Merges has higher precedance than all other input sources.
     *
     * @var AnyObject
     */
    protected _merges: AnyObject;
    /**
     * Creates a new request input manager which is repsonsible for
     * querying through app input fields. Also allows adding new inputs
     * from the application by merge functions.
     *
     * @param request
     */
    constructor(request: IRequest);
    /**
     * Returns the request inputs. The same input will be returned always even
     * if there are any merges or updates. This is the source input fields of
     * incoming req.
     *
     * If the request is a GET request, only queries are returned as input.
     * For any other requests, query, body and files are returned.
     *
     * Order of precedance is such that query is overridden by body which is
     * overriden by files.
     *
     * @returns
     */
    inputSource(): AnyObject;
    /**
     * Returns all the inputs as an object. Inputs in the order of precedence,
     * highest is at the top.
     *
     * [1] App merges
     * [2] Url params
     * [3] Uploaded files
     * [4] Request body
     * [5] Request query
     *
     * ie, app merges will override other input fields with same name.
     *
     * @returns
     */
    all(): AnyObject;
    /**
     * Adds new params to the merge list. These values will override all
     * the other inputs with the same names.
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
