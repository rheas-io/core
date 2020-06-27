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
var env_1 = require("./env");
var services_1 = require("@rheas/services");
var EnvServiceProvider = /** @class */ (function (_super) {
    __extends(EnvServiceProvider, _super);
    function EnvServiceProvider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Registers the .env file reader service.
     *
     * The service will be responsible for creating, updating
     * any environment variables. Also has a function to update
     * the cached variable, so that environment var updates are
     * synced.
     */
    EnvServiceProvider.prototype.register = function () {
        this.container.singleton(this.name, function (app) {
            return new env_1.Env(app.get('path.root'), app.get('files'));
        });
    };
    return EnvServiceProvider;
}(services_1.ServiceProvider));
exports.EnvServiceProvider = EnvServiceProvider;
