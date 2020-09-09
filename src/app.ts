import path from 'path';
import { Request } from './request';
import { Response } from './response';
import { EnvManager } from './envManager';
import https, { ServerOptions } from 'https';
import { Container } from '@rheas/container';
import { ConfigManager } from './configManager';
import { ServiceManager } from './serviceManager';
import { IApp } from '@rheas/contracts/core/app';
import { IRouter } from '@rheas/contracts/routes';
import { IServiceManager } from '@rheas/contracts/services';
import { IManager, IServerCreator } from '@rheas/contracts/core';
import { IRequest, IResponse, IDbConnector } from '@rheas/contracts';
import http, { Server, IncomingMessage, ServerResponse } from 'http';

export class Application extends Container implements IApp {
    /**
     * Application instance.
     *
     * @var IApp
     */
    private static instance: IApp;

    /**
     * Application environment variable manager. Responsible for caching all the
     * .env variables.
     *
     * @var IManager
     */
    protected _envManager: IManager;

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
     * Registers the core app managers, ConfigManager and ServiceManager that handles
     * configs and serviceProviders respectively.
     */
    constructor(rootPath: string) {
        super();

        Application.instance = this;

        this.registerPaths(rootPath);

        this._envManager = new EnvManager(this.path('env'));
        this._configManager = new ConfigManager(this.path('configs'));
        this._serviceManager = new ServiceManager(this);

        this.registerBaseBindings();
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
     * Registers different application paths
     *
     * @param rootPath
     */
    protected registerPaths(rootPath: string) {
        this.instance('path.root', rootPath);
        this.instance('path.env', path.resolve(rootPath, '..', '.env'));
        this.instance('path.configs', path.resolve(rootPath, 'configs'));
        this.instance('path.assets', path.resolve(rootPath, '..', 'assets'));
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
    protected registerBaseBindings() {
        this.instance('env', this._envManager, true);
        this.instance('configs', this._configManager, true);
        this.instance('services', this._serviceManager, true);

        this._serviceManager.setProviders(this.configs().get('app.providers', {}));
    }

    /**
     * Gets the path instance for the folder. If a path for the folder
     * is not bound, then the root path is returned.
     *
     * @param folder
     */
    public path(folder: string = 'root'): string {
        return this.get('path.' + folder) || this.get('path.root');
    }

    /**
     * Returns the application env manager.
     *
     * @returns
     */
    public env(): IManager {
        return this._envManager;
    }

    /**
     * Returns the application configs manager.
     *
     * @returns
     */
    public configs(): IManager {
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
     * Middleware exception keys setter and getter.
     *
     * Throughout the app certain exceptions will have to be made to
     * services/operations. These are set/get using this function.
     *
     * @param key
     * @param value
     */
    public exceptions(key: string, value?: string[]): string[] {
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
        const connector: IDbConnector | null = this.get('db');

        if (connector === null) {
            throw new Error('No database service is registered. Fix the app providers list');
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
            throw new Error('No router service is registered. Fix the app providers list');
        }
        const request = req as IRequest;
        let response = res as IResponse;

        try {
            await request.boot(this, response);

            response = await router.handle(request, response);
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
     * @override Container getter
     *
     * Returns the rheas binding of the specified key. If a binding is not
     * found, we will check for any deferred services and register if one exist.
     * Then we will try to get the binding once again.
     *
     * @param key The binding key to retreive
     */
    public get(key: string, defaultValue?: any): any {
        const service = super.get(key);

        // If no service is found we will load any deferredServices. If the
        // deferred service is loaded, we will try getting the value again from the
        // Container.
        if (service === null && this._serviceManager.registerServiceByName(key)) {
            return super.get(key, defaultValue);
        }
        return service ?? defaultValue;
    }
}
