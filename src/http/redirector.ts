import { IRedirector } from "@rheas/contracts/core";
import { IRequest, IResponse } from "@rheas/contracts";
import { InvalidArgumentException } from "@rheas/errors/invalidArgument";

export class Redirector implements IRedirector {

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
    constructor(request: IRequest, response: IResponse) {
        this._request = request;
        this._response = response;
    }

    /**
     * @inheritdoc
     * 
     * @param status 
     */
    public home(status: number = 302): IResponse {
        throw new Error("Method not implemented.");
    }

    /**
     * @inheritdoc
     * 
     * @param status 
     */
    public back(status: number = 302, fallback: string = ""): IResponse {

        const url = fallback;

        return this.createRedirectResponse(url, status);
    }

    /**
     * @inheritdoc
     * 
     * @param status 
     */
    public refresh(status: number = 302): IResponse {

        return this.createRedirectResponse(this._request.getFullUrl(), status);
    }

    /**
     * @inheritdoc
     * 
     * @param path 
     * @param status 
     */
    public to(path: string, status: number = 302): IResponse {

        return this.createRedirectResponse(path, status);
    }

    /**
     * @inheritdoc
     * 
     * @param name 
     * @param status 
     */
    public toRoute(name: string, status: number = 302): IResponse {

        return this.createRedirectResponse(name, status);
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