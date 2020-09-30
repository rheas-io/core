import { Obj } from '@rheas/support/obj';
import { IRequestInput } from '@rheas/contracts/core';
import { IRequest, AnyObject } from '@rheas/contracts';

export class RequestInput implements IRequestInput {
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
    protected _merges: AnyObject = {};

    /**
     * Creates a new request input manager which is repsonsible for
     * querying through app input fields. Also allows adding new inputs
     * from the application by merge functions.
     *
     * @param request
     */
    constructor(request: IRequest) {
        this._request = request;
    }

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
    public inputSource(): AnyObject {
        if (['GET', 'HEAD'].includes(this._request.getRealMethod())) {
            return Object.assign({}, this._request.query());
        }
        return Object.assign(
            {},
            this._request.query(),
            this._request.body(),
            this._request.files(),
        );
    }

    /**
     * Returns all the inputs as an object. Inputs order of precedence is given
     * below, highest is at the top.
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
    public all(): AnyObject {
        return Object.assign(
            this.inputSource(),
            this._request.params().getStringObject(),
            this._merges,
        );
    }

    /**
     * Adds new params to the merge list. These values will override all
     * the other inputs with the same names.
     *
     * @param newParams
     */
    public merge(newParams: AnyObject): IRequestInput {
        Object.assign(this._merges, newParams);

        return this;
    }

    /**
     * Returns the input value for the key.
     *
     * @param key
     * @param defaultValue
     */
    public get(key: string, defaultValue: any = null): any {
        return Obj.get(this.all(), key, defaultValue);
    }
}
