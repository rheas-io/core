"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var redirector_1 = require("./redirector");
var services_1 = require("@rheas/services");
var RedirectServiceProvider = /** @class */ (function (_super) {
    __extends(RedirectServiceProvider, _super);
    function RedirectServiceProvider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * As this is a deferred service, redirector will be registerd only
     * when the service is requested.
     */
    RedirectServiceProvider.prototype.register = function () {
        this.container.singleton(this.name, function (request) {
            var app = request.get('app');
            var urlGenerator = app.get('url');
            return new redirector_1.Redirector(urlGenerator, request, request.get('response'));
        });
    };
    return RedirectServiceProvider;
}(services_1.DeferredServiceProvider));
exports.RedirectServiceProvider = RedirectServiceProvider;
