"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const request_1 = require("./request");
const response_1 = require("./response");
const envManager_1 = require("./envManager");
const https_1 = __importDefault(require("https"));
const container_1 = require("@rheas/container");
const configManager_1 = require("./configManager");
const serviceManager_1 = require("./serviceManager");
const http_1 = __importDefault(require("http"));
class Application extends container_1.Container {
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
    constructor(rootPath) {
        super();
        Application.instance = this;
        this.registerPaths(rootPath);
        this._envManager = new envManager_1.EnvManager(this.path('env'));
        this._configManager = new configManager_1.ConfigManager(this.path('configs'));
        this._serviceManager = new serviceManager_1.ServiceManager(this, this.configs().get('app.providers', {}));
    }
    /**
     * Returns an application instance. If no instance is available,
     * creates a new instance with the given root path. If no root path
     * is given, we will resolve a directory based on the location of this file.
     *
     * Generally, this script will be located on project_root/node_modules/rheas/core
     * Hence, we resolve it three level updwards to find the project root.
     */
    static getInstance(rootPath = "") {
        if (!Application.instance) {
            rootPath = rootPath || path_1.default.resolve(__dirname, "../../..");
            Application.instance = new Application(rootPath);
        }
        return Application.instance;
    }
    /**
     * Registers different application paths
     *
     * @param rootPath
     */
    registerPaths(rootPath) {
        this.instance('path.root', rootPath);
        this.instance('path.env', path_1.default.resolve(rootPath, '..', '.env'));
        this.instance('path.configs', path_1.default.resolve(rootPath, 'configs'));
        this.instance('path.assets', path_1.default.resolve(rootPath, '..', 'assets'));
    }
    /**
     * Gets the path instance for the folder. If a path for the folder
     * is not bound, then the root path is returned.
     *
     * @param folder
     */
    path(folder = "root") {
        return this.get('path.' + folder) || this.get('path.root');
    }
    /**
     * Returns the application environment variable manager.
     *
     * @returns
     */
    env() {
        return this._envManager;
    }
    /**
     * Returns the application configs manager.
     *
     * @returns
     */
    configs() {
        return this._configManager;
    }
    /**
     * Returns the application services manager.
     *
     * @returns
     */
    services() {
        return this._serviceManager;
    }
    /**
     * Middleware exception keys setter and getter.
     *
     * Throughout the app certain exceptions will have to be made to
     * services/operations. These are set/get using this function.
     *
     * @param key
     * @param value
     */
    exceptions(key, value) {
        const bindKey = 'exceptions.' + key;
        // If value is null, act as a getter. Returns the string
        // array for the exceptions if it exists or returns an 
        // empty array 
        if (value == null) {
            return this.get(bindKey, []);
        }
        // If value is undefined, set it to an empty array and
        // proceed with binding to the container.
        value = value || [];
        // Non singleton binding, so can be updated with new values
        // from anywhere.
        this.instance(bindKey, value);
        return value;
    }
    /**
     * Starts the application. Boots all the registered services,
     * creates a database connection and listen for requests.
     */
    startApp() {
        // Boot the application services before starting the server
        this._serviceManager.boot();
        // Establish connection to the database before opening a 
        // port. On successfull connection, open a port and listen to
        // requests. Otherwise, log the error and exit the process.
        this.initDbConnection()
            .then(() => this.enableHttpServer())
            .catch(error => {
            console.error("Error connecting to database. Server not started.");
            console.error(error);
            process.exit(1);
        });
    }
    /**
     * Connects to the database connector bound by the keyword "db". An
     * exception is thrown if no db service is defined. Db services are core
     * part of the application, so we can't proceed without having one.
     *
     * @return Promise
     */
    initDbConnection() {
        const connector = this.get('db');
        if (connector === null) {
            throw new Error("No database service is registered. Fix the app providers list");
        }
        return connector.connect();
    }
    /**
     * Request handler. When a new request is received by the core http module,
     * it will send it to this handler. From here, we will pass it to the router.
     *
     * @param req
     * @param res
     */
    async listenRequests(req, res) {
        const router = this.get('router');
        if (router === null) {
            throw new Error("No router service is registered. Fix the app providers list");
        }
        const request = req;
        let response = res;
        try {
            await request.boot(this, response);
            response = await router.handle(request, response);
        }
        catch (err) {
            err.message = "Status 500: Exception handler failure." + (err.message || 'Server error');
            response.statusCode = 500;
            response.setContent(err.message);
        }
        response = response.prepareResponse();
        response = response.send();
    }
    /**
     * Creates an http server and listens on the port specified in the app
     * configuration file.
     *
     * @return this
     */
    enableHttpServer() {
        const port = this.normalizePort(this.configs().get('app.port'));
        this.createServer(http_1.default.createServer, port);
        return this;
    }
    /**
     * Creates an https server and listens on the secure_port defined in the
     * app configuration. Creating an https server also requires a valid ssl
     * certificate path on the configs.
     *
     * @return this
     */
    enableHttpsServer() {
        const port = this.normalizePort(this.configs().get('app.secure_port'));
        this.createServer(https_1.default.createServer, port);
        return this;
    }
    /**
     * Creates a server using the creator function and listens on the
     * given port.
     *
     * @param creator
     * @param port
     */
    createServer(creator, port, options) {
        options = Object.assign({}, options, {
            IncomingMessage: request_1.Request,
            ServerResponse: response_1.Response
        });
        const server = creator(options, this.listenRequests.bind(this));
        server.listen(port);
        server.on('listening', () => this.onListening(server));
        server.on('error', (error) => this.onError(error, port));
        return server;
    }
    /**
     * Convert port inputs into an integer value
     *
     * @param val Port value
     */
    normalizePort(val) {
        var port = parseInt(val, 10);
        return isNaN(port) ? val : (port >= 0 ? port : false);
    }
    /**
     * Error callback to show pretty human readable error message.
     *
     * @param error
     */
    onError(error, port) {
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
    }
    /**
     * Server connection success callback. Log the connection success messages.
     *
     * @param server
     */
    onListening(server) {
        const addr = server.address();
        if (addr != null) {
            const bind = typeof addr == 'string' ? 'pipe ' + addr : 'port ' + addr.port;
            console.log('Listening on ' + bind);
        }
    }
    /**
     * @override Container getter
     *
     * Returns the rheas binding of the specified key. If a binding is not
     * found, we will check for any deferred services and register if one exist.
     * Then we will try to get the binding once again.
     *
     * @param key The binding key to retreive
     */
    get(key, defaultValue) {
        const service = super.get(key, defaultValue);
        // If no service is found we will load any deferredServices. If the 
        // deferred service is loaded, we will try getting the value again from the
        // Container.
        if (service === null && this._serviceManager.registerServiceByName(key)) {
            return super.get(key, defaultValue);
        }
        return service;
    }
}
exports.Application = Application;
