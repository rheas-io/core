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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var support_1 = require("@laress/support");
var container_1 = require("./container");
var http_1 = require("./http");
var https_1 = __importDefault(require("https"));
var configManager_1 = require("./configManager");
var http_2 = __importDefault(require("http"));
var Application = /** @class */ (function (_super) {
    __extends(Application, _super);
    /**
     * Creates a new singleton Laress Application. This class acts as a container
     * where other instances/objects can be mount. The laress server has to be started
     * using startApp method of this class.
     *
     * Before starting the app, a rootpath has to be set.
     */
    function Application(rootPath) {
        var _this = _super.call(this) || this;
        /**
         * Stores the boot status of this service provider.
         *
         * @var boolean
         */
        _this._booted = false;
        /**
         * Stores the registration status of this service provider.
         *
         * @var boolean
         */
        _this._registered = false;
        /**
         * Application configurations manager. Handles the parsing and retreival
         * of configuration files.
         *
         * @var IConfigManager
         */
        _this._configManager = null;
        /**
         * Stores all the service providers of the application.
         *
         * @var object
         */
        _this._services = {};
        /**
         * Stores the alias of all the registered service providers.
         *
         * @var array
         */
        _this._loadedServices = {};
        /**
         * Stores the alias of all the deferred services, which can be loaded
         * later.
         *
         * @var array
         */
        _this._deferredServices = [];
        _this._rootPath = rootPath;
        _this.registerBaseBindings();
        return _this;
    }
    /**
     * Registers this app and and config bindings to the container.
     * Also sets the container instance to this object.
     */
    Application.prototype.registerBaseBindings = function () {
        var _this = this;
        container_1.Container.setInstance(this);
        this.singleton('app', function () { return _this; });
        this.singleton('config', function () { return _this.registerConfigManager(); });
    };
    /**
     * Registers the configuration manager on the app instance. Configuration
     * manager is reponsible for handling the different configuration files.
     *
     * @return IConfigManager
     */
    Application.prototype.registerConfigManager = function () {
        var configPath = support_1.Str.trimEnd(this.getRootPath(), path_1.default.sep) + path_1.default.sep + this.get;
        this._configManager = new configManager_1.ConfigManager(configPath);
        return this._configManager;
    };
    /**
     * Registers the necessary service providers. Deferred services are
     * cached in the deferred providers list and are loaded only when a
     * binding request is made to the service.
     */
    Application.prototype.register = function () {
        if (this.isRegistered()) {
            return;
        }
        //@ts-ignore
        this._services = this.config('app.providers', this._services);
        for (var alias in this._services) {
            var service = this._services[alias];
            // A service can be deferred to load when it is absolutely needed.
            // Such services should have a provides property that states, to which
            // alias it should be loaded.
            if ('provide' in service && !this._deferredServices.includes(alias)) {
                this._deferredServices.push(name);
            }
            // If the service doesn't has to be deferred, we will register
            // them immediately.
            else {
                this.registerService(name, new service(this));
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
    Application.prototype.registerService = function (name, serviceProvider) {
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
    Application.prototype.registerServiceByName = function (name) {
        if (this.isServiceLoaded(name)) {
            return;
        }
        var service = this._services[name];
        if (service) {
            this.registerService(name, new service(this));
        }
    };
    /**
     * Checks if a service by this name is already loaded.
     *
     * @param name
     */
    Application.prototype.isServiceLoaded = function (name) {
        return !!this._loadedServices[name];
    };
    /**
     * Checks if the service is a deferred.
     *
     * @param name
     */
    Application.prototype.isDeferredService = function (name) {
        return this._deferredServices.includes(name);
    };
    /**
     * Boots the necessary service providers and boots each one of them.
     * Once that is done, we will update the application booted status. We will register
     * this service provider, if it is not registered yet.
     */
    Application.prototype.boot = function () {
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
    Application.prototype.bootService = function (service) {
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
     * Starts the server after registering service providers and listen
     * for requests.
     */
    Application.prototype.startApp = function () {
        // Boot the application before starting the server
        this.boot();
        // Establish connection to the database before opening a 
        // port. On successfull connection, open a port and listen to
        // requests. Otherwise, log the error and exit the process.
        /*
        this.initDbConnection()
            .then(() => this.enableHttpServer())
            .catch(error => {
                console.error("Error connecting to database. Server not started.");
                console.error(error);
                process.exit(1);
            });*/
        this.enableHttpServer();
    };
    Application.prototype.initDbConnection = function () {
        throw new Error("Method not implemented.");
    };
    /**
     * Request handler. When a new request is received by the core http module,
     * it will send it to this handler. From here, we will pass it to the router.
     *
     * @param req
     * @param res
     */
    Application.prototype.listenRequests = function (req, res) {
        var request = req;
        var response = res;
        var router = this.get('router');
        //if (router === null) {
        //  throw new Error("No router defined for the application. Fix the app providers list");
        //}
        //router.processRequest(request, response);
        response.end("Hello world");
    };
    /**
     * Creates an http server and listens on the port specified in the app
     * configuration file.
     *
     * @return this
     */
    Application.prototype.enableHttpServer = function () {
        var port = this.normalizePort(this.config('app.port'));
        this.createServer(http_2.default.createServer, port);
        return this;
    };
    /**
     * Creates an https server and listens on the secure_port defined in the
     * app configuration. Creating an https server also requires providing certificate
     * file paths to the
     *
     * @return this
     */
    Application.prototype.enableHttpsServer = function () {
        var port = this.normalizePort(this.config('app.secure_port'));
        this.createServer(https_1.default.createServer, port);
        return this;
    };
    /**
     * Creates a server using the creator function and listens on the
     * given port.
     *
     * @param creator
     * @param port
     */
    Application.prototype.createServer = function (creator, port, options) {
        var _this = this;
        options = Object.assign({}, options, {
            IncomingMessage: http_1.Request,
            ServerResponse: http_1.Response
        });
        var server = creator(options, this.listenRequests.bind(this));
        server.listen(port);
        server.on('listening', function () { return _this.onListening(server); });
        server.on('error', function (error) { return _this.onError(error, port); });
        return server;
    };
    /**
     * Convert port inputs into an integer value
     *
     * @param val Port value
     */
    Application.prototype.normalizePort = function (val) {
        var port = parseInt(val, 10);
        return isNaN(port) ? val : (port >= 0 ? port : false);
    };
    /**
     * Error callback to show pretty human readable error message.
     *
     * @param error
     */
    Application.prototype.onError = function (error, port) {
        if (error.syscall !== 'listen') {
            throw error;
        }
        var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
            default:
                throw error;
        }
    };
    /**
     * Server connection success callback. Log the connection success messages.
     *
     * @param server
     */
    Application.prototype.onListening = function (server) {
        var addr = server.address();
        if (addr != null) {
            var bind = typeof addr == 'string' ? 'pipe ' + addr : 'port ' + addr.port;
            console.log('Listening on ' + bind);
        }
    };
    /**
     * Returns a configuration data for the key.
     *
     * @param key
     * @param defaultValue
     */
    Application.prototype.config = function (key, defaultValue) {
        if (this._configManager == null) {
            this._configManager = this.registerConfigManager();
        }
        return this._configManager.get(key, defaultValue);
    };
    /**
     * Sets the registration status of this service provider
     *
     * @param status
     */
    Application.prototype.setRegistered = function (status) {
        this._registered = status;
    };
    /**
     * Sets the boot status of this service provider
     *
     * @param status
     */
    Application.prototype.setBooted = function (status) {
        this._booted = status;
    };
    /**
     * Register status of this service provider
     *
     * @return boolean
     */
    Application.prototype.isRegistered = function () {
        return this._registered;
    };
    /**
     * Boot status of this service provider
     *
     * @return boolean
     */
    Application.prototype.isBooted = function () {
        return this._booted;
    };
    /**
     * Gets the root path of the application
     *
     * @return string
     */
    Application.prototype.getRootPath = function () {
        return this._rootPath;
    };
    /**
     * Returns the asset path of the application
     *
     * @return string
     */
    Application.prototype.getAssetPath = function () {
        return path_1.default.resolve(this._rootPath, '..', 'assets');
    };
    /**
     * Returns the laress binding of the specified key. If a binding is not
     * found, we will check for any deferred services and register if one exist.
     * Then we will try to get the binding once again.
     *
     * @param key The binding key to retreive
     * @param defaultValue The default value to return, if no bindings found
     */
    Application.prototype.get = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        var service = _super.prototype.get.call(this, key, defaultValue);
        if (service === null && this.isDeferredService(key)) {
            this.registerServiceByName(key);
            return this.get(key, defaultValue);
        }
        return service;
    };
    return Application;
}(container_1.Container));
exports.default = Application;
