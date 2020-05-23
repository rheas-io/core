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
var serviceProvider_1 = require("../serviceProvider");
var RedirectServiceProvider = /** @class */ (function (_super) {
    __extends(RedirectServiceProvider, _super);
    function RedirectServiceProvider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Registers the redirect service when requested.
     */
    RedirectServiceProvider.prototype.register = function () {
        this.container.singleton('redirect', function (request) {
            return new redirector_1.Redirector(request, request.get('response'));
        });
    };
    /**
     * The service will be created only if requested by this name.
     *
     * @returns string
     */
    RedirectServiceProvider.prototype.provide = function () {
        return 'redirect';
    };
    return RedirectServiceProvider;
}(serviceProvider_1.ServiceProvider));
exports.RedirectServiceProvider = RedirectServiceProvider;
