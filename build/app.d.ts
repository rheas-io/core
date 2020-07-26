/// <reference types="node" />
import { Container } from "@rheas/container";
import { IApp } from "@rheas/contracts/core/app";
import { IServiceManager } from "@rheas/contracts/services";
import { IManager } from "@rheas/contracts/core";
import { IncomingMessage, ServerResponse } from "http";
export declare class Application extends Container implements IApp {
    /**
     * Application instance.
     *
     * @var IApp
     */
    private static instance;
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
    constructor(rootPath: string);
    /**
     * Returns an application instance. If no instance is available,
     * creates a new instance with the given root path. If no root path
     * is given, we will resolve a directory based on the location of this file.
     *
     * Generally, this script will be located on project_root/node_modules/rheas/core
     * Hence, we resolve it three level updwards to find the project root.
     */
    static getInstance(rootPath?: string): IApp;
    /**
     * Registers different application paths
     *
     * @param rootPath
     */
    protected registerPaths(rootPath: string): void;
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
    protected registerBaseBindings(): void;
    /**
     * Gets the path instance for the folder. If a path for the folder
     * is not bound, then the root path is returned.
     *
     * @param folder
     */
    path(folder?: string): string;
    /**
     * Returns the application configs manager.
     *
     * @returns
     */
    configs(): IManager;
    /**
     * Returns the application services manager.
     *
     * @returns
     */
    services(): IServiceManager;
    /**
     * Middleware exception keys setter and getter.
     *
     * Throughout the app certain exceptions will have to be made to
     * services/operations. These are set/get using this function.
     *
     * @param key
     * @param value
     */
    exceptions(key: string, value?: string[]): string[];
    /**
     * Starts the application. Boots all the registered services,
     * creates a database connection and listen for requests.
     */
    startApp(): void;
    /**
     * Connects to the database connector bound by the keyword "db". An
     * exception is thrown if no db service is defined. Db services are core
     * part of the application, so we can't proceed without having one.
     *
     * @return Promise
     */
    initDbConnection(): Promise<any>;
    /**
     * Request handler. When a new request is received by the core http module,
     * it will send it to this handler. From here, we will pass it to the router.
     *
     * @param req
     * @param res
     */
    listenRequests(req: IncomingMessage, res: ServerResponse): Promise<any>;
    /**
     * Creates an http server and listens on the port specified in the app
     * configuration file.
     *
     * @return this
     */
    enableHttpServer(): IApp;
    /**
     * Creates an https server and listens on the secure_port defined in the
     * app configuration. Creating an https server also requires a valid ssl
     * certificate path on the configs.
     *
     * @return this
     */
    enableHttpsServer(): IApp;
    /**
     * Creates a server using the creator function and listens on the
     * given port.
     *
     * @param creator
     * @param port
     */
    private createServer;
    /**
     * Convert port inputs into an integer value
     *
     * @param val Port value
     */
    private normalizePort;
    /**
     * Error callback to show pretty human readable error message.
     *
     * @param error
     */
    private onError;
    /**
     * Server connection success callback. Log the connection success messages.
     *
     * @param server
     */
    private onListening;
    /**
     * @override Container getter
     *
     * Returns the rheas binding of the specified key. If a binding is not
     * found, we will check for any deferred services and register if one exist.
     * Then we will try to get the binding once again.
     *
     * @param key The binding key to retreive
     */
    get(key: string, defaultValue?: any): any;
}
