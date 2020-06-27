import { IRedirector } from "@rheas/contracts/core";
import { IUrlGenerator } from "@rheas/contracts/routes";
import { IRequest, IResponse, AnyObject } from "@rheas/contracts";
export declare class Redirector implements IRedirector {
    /**
     * The application url resolver
     *
     * @var IUrlGenerator
     */
    protected _urlResolver: IUrlGenerator;
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
    constructor(urlGenerator: IUrlGenerator, request: IRequest, response: IResponse);
    /**
     * Redirects the request to home page.
     *
     * @param params
     * @param status
     */
    home(params?: AnyObject, status?: number): IResponse;
    /**
     * Redirects the request back to the Referrer header or to the
     * previous url in the session. If no url is resolved from header or
     * session, fallback is used.
     *
     * @param status
     */
    back(status?: number, fallback?: string): IResponse;
    /**
     * Refreshes the request by reloading the request url
     *
     * @param status
     */
    refresh(status?: number): IResponse;
    /**
     * Redirects the request to the given path/url.
     *
     * @param path
     * @param params
     * @param status
     */
    to(path: string, params?: AnyObject, status?: number): IResponse;
    /**
     * @inheritdoc
     *
     * @param name
     * @param params
     * @param status
     */
    toRoute(name: string, params?: AnyObject, status?: number): IResponse;
    /**
     * Updates the response with redirect headers and content.
     *
     * @param url
     * @param status
     */
    createRedirectResponse(url: string, status?: number): IResponse;
}
