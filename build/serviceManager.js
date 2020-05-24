"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("./errors");
var ServiceManager = /** @class */ (function () {
    /**
     *
     * @param container
     * @param providers
     */
    function ServiceManager(container, providers) {
        if (providers === void 0) { providers = {}; }
        /**
         * Stores the boot status of this service provider.
         *
         * @var boolean
         */
        this._booted = false;
        /**
         * Stores the registration status of this service provider.
         *
         * @var boolean
         */
        this._registered = false;
        /**
         * Stores all the service providers of the application.
         *
         * @var object
         */
        this._services = {};
        /**
         * Stores the alias of all the registered service providers.
         *
         * @var array
         */
        this._loadedServices = {};
        this._container = container;
        this._services = providers;
    }
    /**
     * Sets the service providers handled by this manager. Services are not updated
     * if the manager is already registered.
     *
     * @param providers
     */
    ServiceManager.prototype.setProviders = function (providers) {
        if (this.isRegistered()) {
            return;
        }
        this._services = providers;
    };
    /**
     * @inheritdoc
     *
     * @param name
     * @param provider
     */
    ServiceManager.prototype.newService = function (name, provider) {
        if (this.isServiceLoaded(name)) {
            throw new errors_1.InvalidArgumentException("A service " + name + " is already loaded/registered. Check the app/request configuration files for \n                service provider list.");
        }
        this._services[name] = provider;
        // No need to register the service as it will be registered and booted
        // when it is required.
        return this;
    };
    /**
     * Registers the necessary service providers. Deferred services are
     * cached in the deferred providers list and are loaded only when a
     * binding request is made to the service.
     */
    ServiceManager.prototype.register = function () {
        if (this.isRegistered()) {
            return;
        }
        for (var alias in this._services) {
            // A service can be deferred to load when it is absolutely needed.
            // Such services should have a provides property that states, to which
            // alias it should be loaded.
            //
            // If the service doesn't has to be deferred, we will register
            // them immediately.
            if (!('provide' in this._services[alias])) {
                this.registerServiceByName(alias);
            }
        }
        this.setRegistered(true);
    };
    /**
     * Registers a particular service of the given name.
     *
     * @param name
     */
    ServiceManager.prototype.registerServiceByName = function (name) {
        // Return false if the service is already loaded or service
        // is not a class 
        if (this.isServiceLoaded(name) || !('new' in this._services[name])) {
            return false;
        }
        var service = this._services[name];
        var serviceProvider = new service(this._container);
        serviceProvider.register();
        serviceProvider.setRegistered(true);
        this._loadedServices[name] = serviceProvider;
        if (this.isBooted()) {
            this.bootService(serviceProvider);
        }
        return true;
    };
    /**
     * Checks if a service by this name is already loaded.
     *
     * @param name
     */
    ServiceManager.prototype.isServiceLoaded = function (name) {
        return !!this._loadedServices[name];
    };
    /**
     * Registers the necessary service providers, if it is not already
     * registered and boots each one of them. Once that is done, we will
     * update the boot status.
     */
    ServiceManager.prototype.boot = function () {
        if (this.isBooted()) {
            return;
        }
        if (!this.isRegistered()) {
            this.register();
        }
        for (var alias in this._loadedServices) {
            this.bootService(this._loadedServices[alias]);
        }
        this.setBooted(true);
    };
    /**
     * Boots a service provider. If the service is not already registered,
     * it is registered first, before performing the boot.
     *
     * @param service
     */
    ServiceManager.prototype.bootService = function (service) {
        if (service.isBooted()) {
            return;
        }
        if (!service.isRegistered()) {
            service.register();
        }
        service.boot();
        service.setBooted(true);
    };
    /**
     * Sets the registration status of this service provider
     *
     * @param status
     */
    ServiceManager.prototype.setRegistered = function (status) {
        this._registered = status;
    };
    /**
     * Sets the boot status of this service provider
     *
     * @param status
     */
    ServiceManager.prototype.setBooted = function (status) {
        this._booted = status;
    };
    /**
     * Register status of this service provider
     *
     * @return boolean
     */
    ServiceManager.prototype.isRegistered = function () {
        return this._registered;
    };
    /**
     * Boot status of this service provider
     *
     * @return boolean
     */
    ServiceManager.prototype.isBooted = function () {
        return this._booted;
    };
    return ServiceManager;
}());
exports.ServiceManager = ServiceManager;
