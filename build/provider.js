"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ServiceProvider = /** @class */ (function () {
    function ServiceProvider(container) {
        /**
         * Registered status of the provider.
         *
         * @var boolean
         */
        this._registered = false;
        /**
         * Boot status of the provider
         *
         * @var boolean
         */
        this._booted = false;
        this.app = container;
    }
    /**
     * Register the service within this function. This function should
     * not reference other services because they may not be initialized yet.
     * So null check/exception capture is needed or use the boot function.
     */
    ServiceProvider.prototype.register = function () {
    };
    /**
     * Boots the service provider. All the other services will be available
     * inside this function.
     */
    ServiceProvider.prototype.boot = function () {
    };
    ServiceProvider.prototype.setRegistered = function (status) {
        this._registered = status;
    };
    ServiceProvider.prototype.setBooted = function (status) {
        this._booted = status;
    };
    ServiceProvider.prototype.isRegistered = function () {
        return this._registered;
    };
    ServiceProvider.prototype.isBooted = function () {
        return this._booted;
    };
    return ServiceProvider;
}());
exports.ServiceProvider = ServiceProvider;
