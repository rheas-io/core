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
var support_1 = require("@rheas/support");
var container_1 = require("./container");
var http_1 = require("./http");
var https_1 = __importDefault(require("https"));
var configManager_1 = require("./configManager");
var serviceManager_1 = require("./serviceManager");
var http_2 = __importDefault(require("http"));
var Application = /** @class */ (function (_super) {
    __extends(Application, _super);
    /**
     * Creates a new singleton Rheas Application. This class acts as a container
     * where other instances/objects can be mount. The rheas server has to be started
     * using startApp method of this class.
     *
     * Before starting the app, a rootpath has to be set.
     *
     * Registers the core app managers, ConfigManager and ServiceManager that handles configs
     * and serviceProviders respectively.
     */
    function Application(rootPath) {
        var _this = _super.call(this) || this;
        _this._rootPath = rootPath;
        _this._configManager = _this.registerConfigManager();
        _this._serviceManager = new serviceManager_1.ServiceManager(_this, _this.config('app.providers') || {});
        _this.registerBaseBindings();
        return _this;
    }
    /**
     * Registers this app and and config bindings to the container.
     * Also sets the container instance to this object.
     */
    Application.prototype.registerBaseBindings = function () {
        this.instance('app', this, true);
        this.instance('config', this._configManager, true);
        this.instance('services', this._serviceManager, true);
    };
    /**
     * Registers the configuration manager on the app instance. Configuration
     * manager is reponsible for handling the different configuration files.
     *
     * @return IConfigManager
     */
    Application.prototype.registerConfigManager = function () {
        var configPath = support_1.Str.trimEnd(this.getRootPath(), path_1.default.sep) + path_1.default.sep + 'configs';
        this._configManager = new configManager_1.ConfigManager(configPath);
        return this._configManager;
    };
    /**
     * Starts the server after registering service providers and listen
     * for requests.
     */
    Application.prototype.startApp = function () {
        var _this = this;
        // Boot the application before starting the server
        this._serviceManager.boot();
        // Establish connection to the database before opening a 
        // port. On successfull connection, open a port and listen to
        // requests. Otherwise, log the error and exit the process.
        this.initDbConnection()
            .then(function () { return _this.enableHttpServer(); })
            .catch(function (error) {
            console.error("Error connecting to database. Server not started.");
            console.error(error);
            process.exit(1);
        });
    };
    /**
     * Connects to the database connector bound by the keyword "db". An
     * exception is thrown if no db service is defined. Db services are core
     * part of the application, so we can't proceed without having one.
     *
     * @return Promise
     */
    Application.prototype.initDbConnection = function () {
        var connector = this.get('db');
        if (connector === null) {
            throw new Error("No database service is registered. Fix the app providers list");
        }
        return connector.connect();
    };
    /**
     * Request handler. When a new request is received by the core http module,
     * it will send it to this handler. From here, we will pass it to the router.
     *
     * @param req
     * @param res
     */
    Application.prototype.listenRequests = function (req, res) {
        var router = this.get('router');
        if (router === null) {
            throw new Error("No router service is registered. Fix the app providers list");
        }
        var request = req;
        var response = res;
        request.boot(this);
        router.processRequest(request, response)
            .then(function (response) { return response.end(); })
            .catch(function (err) {
            response.statusCode = 500;
            response.end(err.message || "Server error");
        });
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
     * app configuration. Creating an https server also requires a valid ssl
     * certificate path on the configs.
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
     */
    Application.prototype.config = function (key) {
        return this._configManager.get(key);
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
     * @override Container getter
     *
     * Returns the rheas binding of the specified key. If a binding is not
     * found, we will check for any deferred services and register if one exist.
     * Then we will try to get the binding once again.
     *
     * @param key The binding key to retreive
     */
    Application.prototype.get = function (key) {
        var service = _super.prototype.get.call(this, key);
        // If no service is found we will load any deferredServices. If the 
        // deferred service is loaded, we will try getting the value again from the
        // Container.
        if (service === null && this._serviceManager.loadDeferredService(key)) {
            return _super.prototype.get.call(this, key);
        }
        return service;
    };
    return Application;
}(container_1.Container));
exports.Application = Application;
