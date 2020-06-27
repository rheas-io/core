import { IRedirector } from "@rheas/contracts/core";
import { IUrlGenerator } from "@rheas/contracts/routes";
import { IRequest, IResponse, AnyObject } from "@rheas/contracts";
import { InvalidArgumentException } from "@rheas/errors/invalidArgument";

export class Redirector implements IRedirector {

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
    constructor(urlGenerator: IUrlGenerator, request: IRequest, response: IResponse) {
        this._request = request;
        this._response = response;
        this._urlResolver = urlGenerator;
    }

    /**
     * Redirects the request to home page.
     * 
     * @param params
     * @param status 
     */
    public home(params: AnyObject = {}, status: number = 302): IResponse {
        return this.toRoute('home', params, status);
    }

    /**
     * Redirects the request back to the Referrer header or to the 
     * previous url in the session. If no url is resolved from header or
     * session, fallback is used.
     * 
     * @param status 
     */
    public back(status: number = 302, fallback: string = ""): IResponse {

        const url = this._urlResolver.previous(this._request, fallback);

        return this.createRedirectResponse(url, status);
    }

    /**
     * Refreshes the request by reloading the request url
     * 
     * @param status 
     */
    public refresh(status: number = 302): IResponse {
        return this.createRedirectResponse(this._request.getFullUrl(), status);
    }

    /**
     * Redirects the request to the given path/url.
     * 
     * @param path 
     * @param params
     * @param status 
     */
    public to(path: string, params: AnyObject = {}, status: number = 302): IResponse {
        const url = this._urlResolver.to(path, params);

        return this.createRedirectResponse(url, status);
    }

    /**
     * @inheritdoc
     * 
     * @param name 
     * @param params
     * @param status 
     */
    public toRoute(name: string, params: AnyObject = {}, status: number = 302): IResponse {

        const url = this._urlResolver.toRoute(name, params);

        return this.createRedirectResponse(url, status);
    }

    /**
     * Updates the response with redirect headers and content.
     * 
     * @param url 
     * @param status 
     */
    public createRedirectResponse(url: string, status: number = 302): IResponse {

        if (url.length === 0) {
            throw new InvalidArgumentException('Redirect url cannot be empty');
        }

        if (!this._response.isRedirectStatus(status)) {
            throw new InvalidArgumentException(`Given status ${status} is not a valid redirect HTTP status code.`);
        }

        this._response.statusCode = status;
        this._response.setHeader('Location', url);

        this._response.setContent(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8" />
                <meta http-equiv="refresh" content="0;url=${url}" />        
                <title>Redirecting to ${url}</title>
            </head>
            <body>
                Redirecting to <a href="${url}">${url}</a>.
            </body>
        </html>`
        );

        return this._response;
    }
}