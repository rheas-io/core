"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ServiceProvider = /** @class */ (function () {
    /**
     * Creates a new service provider
     *
     * @param name
     * @param container
     */
    function ServiceProvider(name, container) {
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
        this.name = name;
        this.container = container;
    }
    /**
     * Register the service within this function. Referencing other services
     * within this function should be done carefully. It could be possible that
     * referencing service is not registered yet. So proper validation is needed, if
     * referencing other services.
     *
     * And, referencing other service which inturn reference this service could produce
     * an infinite loop.
     */
    ServiceProvider.prototype.register = function () {
    };
    /**
     * Boots the service provider. All the other registered services will be available
     * inside this function.
     */
    ServiceProvider.prototype.boot = function () {
    };
    /**
     * Sets the registration status of this service provider.
     *
     * @param status
     */
    ServiceProvider.prototype.setRegistered = function (status) {
        this._registered = status;
    };
    /**
     * Sets the boot status of this service provider
     *
     * @param status
     */
    ServiceProvider.prototype.setBooted = function (status) {
        this._booted = status;
    };
    /**
     * Returns the registration status of this service provider.
     *
     * @return boolean
     */
    ServiceProvider.prototype.isRegistered = function () {
        return this._registered;
    };
    /**
     * Returns the boot status of this service provider.
     *
     * @return boolean
     */
    ServiceProvider.prototype.isBooted = function () {
        return this._booted;
    };
    return ServiceProvider;
}());
exports.ServiceProvider = ServiceProvider;
