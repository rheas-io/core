import path from "path";
import { Str } from "@rheas/support";
import { Container } from "./container";
import { Request, Response } from "./http";
import https, { ServerOptions } from "https";
import { ConfigManager } from "./configManager";
import { ServiceManager } from "./serviceManager";
import { IApp } from "@rheas/contracts/core/app";
import { IRouter } from "@rheas/contracts/routes";
import { IRequest, IDbConnector } from "@rheas/contracts";
import { IResponse } from "@rheas/contracts/core/response";
import { IServiceManager } from "@rheas/contracts/services";
import { IManager, IServerCreator } from "@rheas/contracts/core";
import http, { Server, IncomingMessage, ServerResponse } from "http";

export class Application extends Container implements IApp {

    /**
     * Stores the root path of the application. This root path is necessary
     * to load different modules of the application.
     * 
     * @var string
     */
    protected _rootPath: string;

    /**
     * Application configurations manager. Handles the parsing and retreival
     * of configuration files.
     * 
     * @var IManager
     */
    protected _configManager: IManager;

    /**
     * Service manager that handles the registering and booting of
     * all service providers.
     * 
     * @var IServiceManager
     */
    protected _serviceManager: IServiceManager;

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
    constructor(rootPath: string) {
        super();

        this._rootPath = rootPath;

        this._configManager = this.registerConfigManager();
        this._serviceManager = new ServiceManager(this, this.config('app.providers') || {});

        this.registerBaseBindings();
    }

    /**
     * Registers this app and and config bindings to the container.
     * Also sets the container instance to this object.
     */
    protected registerBaseBindings() {

        this.instance('app', this, true);

        this.instance('config', this._configManager, true);

        this.instance('services', this._serviceManager, true);
    }

    /**
     * Registers the configuration manager on the app instance. Configuration
     * manager is reponsible for handling the different configuration files.
     * 
     * @return IConfigManager
     */
    private registerConfigManager(): IManager {
        const configPath = Str.trimEnd(this.getRootPath(), path.sep) + path.sep + 'configs';

        this._configManager = new ConfigManager(configPath);

        return this._configManager;
    }

    /**
     * Starts the server after registering service providers and listen
     * for requests.
     */
    public startApp(): void {

        // Boot the application before starting the server
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
    public initDbConnection(): Promise<any> {
        const connector: IDbConnector | null = this.get('db');

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
    public async listenRequests(req: IncomingMessage, res: ServerResponse): Promise<any> {
        const router: IRouter | null = this.get('router');

        if (router === null) {
            throw new Error("No router service is registered. Fix the app providers list");
        }
        const request = <IRequest>req;
        let response = <IResponse>res;

        request.boot(this);

        try {
            response = await router.processRequest(request, response);
        } catch (err) {
            response.statusCode = 500;
            response.setContent(err.message || "Server error");
        }
        response = response.prepareResponse(request);

        response.send();
    }

    /**
     * Creates an http server and listens on the port specified in the app
     * configuration file.
     * 
     * @return this
     */
    public enableHttpServer(): IApp {
        const port = this.normalizePort(this.config('app.port'));

        this.createServer(http.createServer, port);

        return this;
    }

    /**
     * Creates an https server and listens on the secure_port defined in the
     * app configuration. Creating an https server also requires a valid ssl 
     * certificate path on the configs.
     * 
     * @return this
     */
    public enableHttpsServer(): IApp {
        const port = this.normalizePort(this.config('app.secure_port'));

        this.createServer(https.createServer, port);

        return this;
    }

    /**
     * Creates a server using the creator function and listens on the
     * given port.
     * 
     * @param creator 
     * @param port 
     */
    private createServer(creator: IServerCreator, port: number, options?: ServerOptions): Server {
        options = Object.assign({}, options, {
            IncomingMessage: Request,
            ServerResponse: Response
        });

        const server = creator(options, this.listenRequests.bind(this));

        server.listen(port);
        server.on('listening', () => this.onListening(server));
        server.on('error', error => this.onError(error, port));

        return server;
    }

    /**
     * Convert port inputs into an integer value
     * 
     * @param val Port value
     */
    private normalizePort(val: any) {
        var port = parseInt(val, 10);

        return isNaN(port) ? val : (port >= 0 ? port : false);
    }

    /**
     * Error callback to show pretty human readable error message.
     * 
     * @param error 
     */
    private onError(error: any, port: any) {
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
    private onListening(server: http.Server) {
        const addr = server.address();

        if (addr != null) {
            const bind = typeof addr == 'string' ? 'pipe ' + addr : 'port ' + addr.port;
            console.log('Listening on ' + bind);
        }
    }

    /**
     * Returns a configuration data for the key.
     * 
     * @param key 
     */
    public config(key: string) {
        return this._configManager.get(key);
    }

    /**
     * Gets the root path of the application
     * 
     * @return string
     */
    public getRootPath(): string {
        return this._rootPath;
    }

    /**
     * Returns the asset path of the application
     * 
     * @return string
     */
    public getAssetPath(): string {
        return path.resolve(this._rootPath, '..', 'assets');
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
    public get(key: string): any {
        const service = super.get(key);

        // If no service is found we will load any deferredServices. If the 
        // deferred service is loaded, we will try getting the value again from the
        // Container.
        if (service === null && this._serviceManager.loadDeferredService(key)) {
            return super.get(key);
        }
        return service;
    }
}
