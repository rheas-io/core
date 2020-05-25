import { IRedirector } from "@rheas/contracts/core";
import { IRequest, IResponse } from "@rheas/contracts";
export declare class Redirector implements IRedirector {
    /**
     * Current request/container
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
    constructor(request: IRequest, response: IResponse);
    /**
     * @inheritdoc
     *
     * @param status
     */
    home(status?: number): IResponse;
    /**
     * @inheritdoc
     *
     * @param status
     */
    back(status?: number, fallback?: string): IResponse;
    /**
     * @inheritdoc
     *
     * @param status
     */
    refresh(status?: number): IResponse;
    /**
     * @inheritdoc
     *
     * @param path
     * @param status
     */
    to(path: string, status?: number): IResponse;
    /**
     * @inheritdoc
     *
     * @param name
     * @param status
     */
    toRoute(name: string, status?: number): IResponse;
    /**
     * Updates the response with redirect headers and content.
     *
     * @param url
     * @param status
     */
    createRedirectResponse(url: string, status?: number): IResponse;
}
