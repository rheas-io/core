import { IRequest, IResponse } from "@rheas/contracts";

export class Redirector {

    /**
     * Current request
     * 
     * @var IRequest
     */
    protected _request: IRequest;

    /**
     * Response object
     * 
     * @var IResponse
     */
    protected _response: IResponse;

    /**
     * Creates a new Redirect handler.
     * 
     * @param request 
     * @param response
     */
    constructor(request: IRequest, response: IResponse) {
        this._request = request;
        this._response = response;
    }
}