"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var invalidArgument_1 = require("@rheas/errors/invalidArgument");
var Redirector = /** @class */ (function () {
    /**
     * Creates a new Redirect handler.
     *
     * @param request
     * @param response
     */
    function Redirector(request, response) {
        this._request = request;
        this._response = response;
    }
    /**
     * @inheritdoc
     *
     * @param status
     */
    Redirector.prototype.home = function (status) {
        if (status === void 0) { status = 302; }
        throw new Error("Method not implemented.");
    };
    /**
     * @inheritdoc
     *
     * @param status
     */
    Redirector.prototype.back = function (status, fallback) {
        if (status === void 0) { status = 302; }
        if (fallback === void 0) { fallback = ""; }
        var url = fallback;
        return this.createRedirectResponse(url, status);
    };
    /**
     * @inheritdoc
     *
     * @param status
     */
    Redirector.prototype.refresh = function (status) {
        if (status === void 0) { status = 302; }
        return this.createRedirectResponse(this._request.getFullUrl(), status);
    };
    /**
     * @inheritdoc
     *
     * @param path
     * @param status
     */
    Redirector.prototype.to = function (path, status) {
        if (status === void 0) { status = 302; }
        return this.createRedirectResponse(path, status);
    };
    /**
     * @inheritdoc
     *
     * @param name
     * @param status
     */
    Redirector.prototype.toRoute = function (name, status) {
        if (status === void 0) { status = 302; }
        return this.createRedirectResponse(name, status);
    };
    /**
     * Updates the response with redirect headers and content.
     *
     * @param url
     * @param status
     */
    Redirector.prototype.createRedirectResponse = function (url, status) {
        if (status === void 0) { status = 302; }
        if (url.length === 0) {
            throw new invalidArgument_1.InvalidArgumentException('Redirect url cannot be empty');
        }
        if (!this._response.isRedirectStatus(status)) {
            throw new invalidArgument_1.InvalidArgumentException("Given status " + status + " is not a valid redirect HTTP status code.");
        }
        this._response.statusCode = status;
        this._response.setHeader('Location', url);
        this._response.setContent("\n        <!DOCTYPE html>\n        <html>\n            <head>\n                <meta charset=\"UTF-8\" />\n                <meta http-equiv=\"refresh\" content=\"0;url=" + url + "\" />        \n                <title>Redirecting to " + url + "</title>\n            </head>\n            <body>\n                Redirecting to <a href=\"" + url + "\">" + url + "</a>.\n            </body>\n        </html>");
        return this._response;
    };
    return Redirector;
}());
exports.Redirector = Redirector;
