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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var request_1 = require("./request");
var response_1 = require("./response");
var envManager_1 = require("./envManager");
var https_1 = __importDefault(require("https"));
var container_1 = require("@rheas/container");
var configManager_1 = require("./configManager");
var serviceManager_1 = require("./serviceManager");
var http_1 = __importDefault(require("http"));
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
        Application.instance = _this;
        _this.registerPaths(rootPath);
        _this._envManager = new envManager_1.EnvManager(_this.path('env'));
        _this._configManager = new configManager_1.ConfigManager(_this.path('configs'));
        _this._serviceManager = new serviceManager_1.ServiceManager(_this, _this.configs().get('app.providers', {}));
        return _this;
    }
    /**
     * Returns an application instance. If no instance is available,
     * creates a new instance with the given root path. If no root path
     * is given, we will resolve a directory based on the location of this file.
     *
     * Generally, this script will be located on project_root/node_modules/rheas/core
     * Hence, we resolve it three level updwards to find the project root.
     */
    Application.getInstance = function (rootPath) {
        if (rootPath === void 0) { rootPath = ""; }
        if (!Application.instance) {
            rootPath = rootPath || path_1.default.resolve(__dirname, "../../..");
            Application.instance = new Application(rootPath);
        }
        return Application.instance;
    };
    /**
     * Registers different application paths
     *
     * @param rootPath
     */
    Application.prototype.registerPaths = function (rootPath) {
        this.instance('path.root', rootPath);
        this.instance('path.env', path_1.default.resolve(rootPath, '..', '.env'));
        this.instance('path.configs', path_1.default.resolve(rootPath, 'configs'));
        this.instance('path.assets', path_1.default.resolve(rootPath, '..', 'assets'));
    };
    /**
     * Gets the path instance for the folder. If a path for the folder
     * is not bound, then the root path is returned.
     *
     * @param folder
     */
    Application.prototype.path = function (folder) {
        if (folder === void 0) { folder = "root"; }
        return this.get('path.' + folder) || this.get('path.root');
    };
    /**
     * Returns the application environment variable manager.
     *
     * @returns
     */
    Application.prototype.env = function () {
        return this._envManager;
    };
    /**
     * Returns the application configs manager.
     *
     * @returns
     */
    Application.prototype.configs = function () {
        return this._configManager;
    };
    /**
     * Returns the application services manager.
     *
     * @returns
     */
    Application.prototype.services = function () {
        return this._serviceManager;
    };
    /**
     * Starts the application. Boots all the registered services,
     * creates a database connection and listen for requests.
     */
    Application.prototype.startApp = function () {
        var _this = this;
        // Boot the application services before starting the server
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
        return __awaiter(this, void 0, void 0, function () {
            var router, request, response, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        router = this.get('router');
                        if (router === null) {
                            throw new Error("No router service is registered. Fix the app providers list");
                        }
                        request = req;
                        response = res;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        request.boot(response);
                        return [4 /*yield*/, router.handle(request, response)];
                    case 2:
                        response = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        err_1.message = "Status 500: Exception handler failure." + (err_1.message || 'Server error');
                        response.statusCode = 500;
                        response.setContent(err_1.message);
                        return [3 /*break*/, 4];
                    case 4:
                        response = response.prepareResponse();
                        response = response.send();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates an http server and listens on the port specified in the app
     * configuration file.
     *
     * @return this
     */
    Application.prototype.enableHttpServer = function () {
        var port = this.normalizePort(this.configs().get('app.port'));
        this.createServer(http_1.default.createServer, port);
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
        var port = this.normalizePort(this.configs().get('app.secure_port'));
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
            IncomingMessage: request_1.Request,
            ServerResponse: response_1.Response
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
        if (service === null && this._serviceManager.registerServiceByName(key)) {
            return _super.prototype.get.call(this, key);
        }
        return service;
    };
    return Application;
}(container_1.Container));
exports.Application = Application;
