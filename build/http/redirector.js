"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    return Redirector;
}());
exports.Redirector = Redirector;
