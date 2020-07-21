"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const invalidArgument_1 = require("@rheas/errors/invalidArgument");
class Redirector {
    /**
     * Creates a new Redirect handler.
     *
     * @param request
     * @param response
     */
    constructor(urlGenerator, request, response) {
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
    home(params = {}, status = 302) {
        return this.toRoute('home', params, status);
    }
    /**
     * Redirects the request back to the Referrer header or to the
     * previous url in the session. If no url is resolved from header or
     * session, fallback is used.
     *
     * @param status
     */
    back(status = 302, fallback = "") {
        const url = this._urlResolver.previous(this._request, fallback);
        return this.createRedirectResponse(url, status);
    }
    /**
     * Refreshes the request by reloading the request url
     *
     * @param status
     */
    refresh(status = 302) {
        return this.createRedirectResponse(this._request.getFullUrl(), status);
    }
    /**
     * Redirects the request to the given path/url.
     *
     * @param path
     * @param params
     * @param status
     */
    to(path, params = {}, status = 302) {
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
    toRoute(name, params = {}, status = 302) {
        const url = this._urlResolver.toRoute(name, params);
        return this.createRedirectResponse(url, status);
    }
    /**
     * Updates the response with redirect headers and content.
     *
     * @param url
     * @param status
     */
    createRedirectResponse(url, status = 302) {
        if (url.length === 0) {
            throw new invalidArgument_1.InvalidArgumentException('Redirect url cannot be empty');
        }
        if (!this._response.isRedirectStatus(status)) {
            throw new invalidArgument_1.InvalidArgumentException(`Given status ${status} is not a valid redirect HTTP status code.`);
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
        </html>`);
        return this._response;
    }
}
exports.Redirector = Redirector;
