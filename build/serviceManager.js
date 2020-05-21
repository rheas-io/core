"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        /**
         * Stores the alias of all the deferred services, which can be loaded
         * later.
         *
         * @var array
         */
        this._deferredServices = [];
        this._container = container;
        this._services = providers;
    }
    /**
     * Sets the service providers handled by this manager. Services are not updated
     * if the manager is already booted.
     *
     * @param providers
     */
    ServiceManager.prototype.setProviders = function (providers) {
        if (this.isBooted()) {
            return;
        }
        this._services = providers;
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
            var service = this._services[alias];
            // A service can be deferred to load when it is absolutely needed.
            // Such services should have a provides property that states, to which
            // alias it should be loaded.
            if ('provide' in service && !this._deferredServices.includes(alias)) {
                this._deferredServices.push(alias);
            }
            // If the service doesn't has to be deferred, we will register
            // them immediately.
            else {
                this.registerService(alias, new service(this._container));
            }
        }
        this.setRegistered(true);
    };
    /**
     * Registers a service if it is not a deferrable service and boots the
     * same if the app is already booted.
     *
     * @param name
     * @param serviceProvider
     */
    ServiceManager.prototype.registerService = function (name, serviceProvider) {
        if (this.isServiceLoaded(name)) {
            throw new Error("A service '" + name + "' is already registered. Refer the config/app file for all the services.");
        }
        serviceProvider.register();
        serviceProvider.setRegistered(true);
        this._loadedServices[name] = serviceProvider;
        this._deferredServices = this._deferredServices.filter(function (serviceName) { return serviceName !== name; });
        if (this.isBooted()) {
            this.bootService(serviceProvider);
        }
    };
    /**
     * Registers a particular service of the given name.
     *
     * @param name
     */
    ServiceManager.prototype.registerServiceByName = function (name) {
        if (this.isServiceLoaded(name)) {
            return;
        }
        var service = this._services[name];
        if (service) {
            this.registerService(name, new service(this._container));
        }
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
     * Loads a deferred service.
     *
     * @param key
     */
    ServiceManager.prototype.loadDeferredService = function (key) {
        if (this.isDeferredService(key)) {
            this.registerServiceByName(key);
            return true;
        }
        return false;
    };
    /**
     * Checks if the service is a deferred.
     *
     * @param name
     */
    ServiceManager.prototype.isDeferredService = function (name) {
        return this._deferredServices.includes(name);
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
