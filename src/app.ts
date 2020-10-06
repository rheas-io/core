import path from 'path';
import { Request } from './request';
import { Response } from './response';
import { EnvManager } from './envManager';
import https, { ServerOptions } from 'https';
import { Container } from '@rheas/container';
import { ConfigManager } from './configManager';
import { ServiceManager } from '@rheas/services';
import { IRequest, IResponse, IDbConnector } from '@rheas/contracts';
import http, { Server, IncomingMessage, ServerResponse } from 'http';
import { IApp, InternalAppBindings } from '@rheas/contracts/core/app';
import { IGetter, IKernal, IServerCreator } from '@rheas/contracts/core';
import { IServiceManager, IServiceListener, IDriverManager } from '@rheas/contracts/services';

export class Application extends Container implements IApp {
    /**
     * Application instance.
     *
     * @var IApp
     */
    private static instance: IApp;

    /**
     * Flag is set to true if the application is loaded via CLI.
     *
     * @var boolean
     */
    protected _runningInConsole: boolean = false;

    /**
     * Application environment variable manager. Responsible for caching all the
     * .env variables.
     *
     * @var IManager
     */
    protected _envManager: IGetter;

    /**
     * Application configurations manager. Handles the parsing and retreival
     * of configuration files.
     *
     * @var IManager
     */
    protected _configManager: IGetter;

    /**
     * Service manager that handles the registering and booting of
     * all service providers.
     *
     * @var IServiceManager
     */
    protected _serviceManager: IServiceManager & IServiceListener;

    /**
     * Creates a new singleton Rheas Application. This class acts as a container
     * where other instances/objects can be mount. The rheas server has to be started
     * using startApp method of this class.
     *
     * Before starting the app, a rootpath has to be set.
     *
     * Registers the core app managers, ConfigManager and ServiceManager that handles
     * configs and serviceProviders respectively.
     *
     * @param rootPath project root directory
     */
    constructor(rootPath: string) {
        super();

        Application.instance = this;

        this.registerPaths(rootPath);

        this._serviceManager = new ServiceManager(this);
        this._envManager = new EnvManager(this.path('env'));
        this._configManager = new ConfigManager(this.path('configs'));

        this.registerCoreBindings();
        this.registerCoreServices();
        this.registerExitEvents();
    }

    /**
     * Returns an application instance. If no instance is available,
     * creates a new instance with the given root path. If no root path
     * is given, we will resolve a directory based on the location of this file.
     *
     * Generally, this script will be located on project_root/node_modules/rheas/core
     * Hence, we resolve it three level updwards to find the project root.
     */
    public static getInstance(rootPath: string = '') {
        if (!Application.instance) {
            rootPath = rootPath || path.resolve(__dirname, '../../..');

            Application.instance = new Application(rootPath);
        }
        return Application.instance;
    }

    /**
     * Sets the running in console flag to true.
     *
     * @returns
     */
    public setRunningInConsole(): IApp {
        this._runningInConsole = true;

        return this;
    }

    /**
     * Returns true if the application is running in console.
     *
     * @returns
     */
    public isRunningInConsole(): boolean {
        return this._runningInConsole;
    }

    /**
     * Registers different application paths
     *
     * @param rootPath
     */
    protected registerPaths(rootPath: string) {
        this.instance('path.root', rootPath);
        this.instance('path.env', path.resolve(rootPath, '..', '.env'));
        this.instance('path.configs', path.resolve(rootPath, 'configs'));
        this.instance('path.assets', path.resolve(rootPath, '..', 'assets'));
        this.instance('path.sessions', path.resolve(rootPath, '..', 'storage', 'sessions'));
    }

    /**
     * Registers the base application managers on the container.
     *
     * Before reading configs, env services has to be registered. Once env
     * and config manager is registered, we will load the service providers
     * from the config file and inject it into serviceManager.
     *
     * There is no need for _envManager on this class, so we are keeping
     * no references in this object. That's why service providers are loaded
     * here instead of initialization in the constructor.
     */
    protected registerCoreBindings() {
        this.instance('env', this._envManager, true);
        this.instance('configs', this._configManager, true);
        this.instance('services', this._serviceManager, true);
    }

    /**
     * Loads the services on to the application service manager and also
     * registers core services like error, which takes care of exception
     * handling, and middlewares, which is important for accepting requests.
     */
    protected registerCoreServices() {
        this._serviceManager.setProviders(this.configs().get('app.providers', {}));

        this._serviceManager.registerServiceByName('error');
        this._serviceManager.registerServiceByName('middlewares');
    }

    /**
     * Registers a callback that has to be executed after registering.
     *
     * @param callback
     */
    public registered(callback: () => any): void {
        this._serviceManager.registered(callback);
    }

    /**
     * Registers a callback that has to be executed after booting all the
     * application services.
     *
     * @param callback
     */
    public booted(callback: () => any): void {
        this._serviceManager.booted(callback);
    }

    /**
     * Registers process listeners for application exit events. We will
     * close all the database connections when an exit signal is triggered.
     */
    protected registerExitEvents() {
        const listener = this.terminate.bind(this);

        process.on('SIGINT', listener);
        process.on('SIGUSR1', listener);
        process.on('SIGUSR2', listener);
        process.on('SIGTERM', listener);
        //process.on('uncaughtException', listener);
    }

    /**
     * Initiates the application termination. All the database connections
     * are closed first to gracefully terminate the application.
     */
    public async terminate() {
        try {
            const db: IDriverManager<IDbConnector<any>> = this.get('db');

            await db.getDriver().closeConnections();

            return process.exit(0);
        } catch (err) {
            console.log('Error closing all the database connections.');
            console.log(err);
        }
        return process.exit(1);
    }

    /**
     * Gets the path instance for the folder. If a path for the folder
     * is not bound, then the root path is returned.
     *
     * @param folder
     */
    public path(folder: string = 'root'): string {
        return this.get('path.' + folder);
    }

    /**
     * Returns the application env manager.
     *
     * @returns
     */
    public env(): IGetter {
        return this._envManager;
    }

    /**
     * Returns the application configs manager.
     *
     * @returns
     */
    public configs(): IGetter {
        return this._configManager;
    }

    /**
     * Returns the application services manager.
     *
     * @returns
     */
    public services(): IServiceManager {
        return this._serviceManager;
    }

    /**
     * Middleware exception keys setter.
     *
     * Throughout the application, certain exceptions have to be made
     * while performing different operations. These are set using this
     * function.
     *
     * @param key
     * @param value
     */
    public setExceptions(key: string, value: string[]): IApp {
        const bindKey = 'exceptions.' + key;

        // Non singleton binding, so can be updated with new values
        // from anywhere.
        this.instance(bindKey, value);

        return this;
    }

    /**
     * Middleware exception keys getter. Gets the exceptions set on
     * the given key. An empty array is returned if no exception has been
     * set for the key.
     *
     * @param key
     */
    public exceptions(key: string): string[] {
        const bindKey = 'exceptions.' + key;

        try {
            return this.get(bindKey);
        } catch (error) {
            // Possible binding not found excepion. We will return
            // an empty array if an exception is thrown.
        }
        return [];
    }

    /**
     * Starts the application. Boots all the registered services,
     * creates a database connection and listen for requests.
     */
    public startApp(): void {
        // Boot the application services before starting the server
        this.bootServices();

        // Establish connection to the database before opening a
        // port. On successfull connection, open a port and listen to
        // requests. Otherwise, log the error and exit the process.
        this.connectToDatabase()
            .then(() => this.enableHttpServer())
            .catch((error) => {
                console.error('Error connecting to database. Server not started.');
                console.error(error);
                process.exit(1);
            });
    }

    /**
     * This function boots all the application services.
     *
     * The application services should be booted before it starts
     * listening to requests.
     */
    public bootServices(): void {
        this._serviceManager.boot();
    }

    /**
     * Connects to the database connector bound by the keyword "db". An
     * exception is thrown if no db service is defined. Db services are core
     * part of the application, so we can't proceed without having one.
     *
     * Ideally the application should start listening to requests only
     * when the promise gets resolved.
     */
    public connectToDatabase(): Promise<any> {
        const connector: IDriverManager<IDbConnector<any>> = this.get('db');

        if (connector === null) {
            throw new Error('No database service is registered. Fix the app providers list');
        }
        return connector.getDriver().connect();
    }

    /**
     * Request handler. When a new request is received by the core http module,
     * it will send it to this handler. From here, we will pass it to the router.
     *
     * @param req
     * @param res
     */
    public async listenRequests(req: IncomingMessage, res: ServerResponse): Promise<any> {
        const request = req as IRequest;
        let response = res as IResponse;

        try {
            const kernal: IKernal = this.get('kernal');

            await request.boot(this, response);

            response = await kernal.handle(request, response);
        } catch (err) {
            err.message =
                'Status 500: Exception handler failure.' + (err.message || 'Server error');
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
    public enableHttpServer(): IApp {
        const port = this.normalizePort(this.configs().get('app.port'));

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
        const port = this.normalizePort(this.configs().get('app.secure_port'));

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
            ServerResponse: Response,
        });

        const server = creator(options, this.listenRequests.bind(this));

        server.listen(port);
        server.on('listening', () => this.onListening(server));
        server.on('error', (error: any) => this.onError(error, port));

        return server;
    }

    /**
     * Convert port inputs into an integer value
     *
     * @param val Port value
     */
    private normalizePort(val: any) {
        var port = parseInt(val, 10);

        return isNaN(port) ? val : port >= 0 ? port : false;
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
     * @override
     *
     * Initially we will load any deferred service with the given name. After
     * that we will try to fetch the binding from the container. If no binding
     * is found, an exception will be thrown by the container.
     *
     * @param key The binding key to retreive
     */
    public get(key: InternalAppBindings | string): any {
        this._serviceManager.registerServiceByName(key);

        return super.get(key);
    }
}
