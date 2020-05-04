/// <reference types="node" />
import { Container } from "./container";
import { IApp } from "@laress/contracts/core/app";
import { KeyValue, ClassOf } from "@laress/contracts";
import { IncomingMessage, ServerResponse } from "http";
import { IServiceProvider, IConfigManager } from "@laress/contracts/core";
declare class Application extends Container implements IApp {
    /**
     * Stores the root path of the application. This root path is necessary
     * to load different modules of the application.
     *
     * @var string
     */
    protected _rootPath: string;
    /**
     * Stores the boot status of this service provider.
     *
     * @var boolean
     */
    protected _booted: boolean;
    /**
     * Stores the registration status of this service provider.
     *
     * @var boolean
     */
    protected _registered: boolean;
    /**
     * Application configurations manager. Handles the parsing and retreival
     * of configuration files.
     *
     * @var IConfigManager
     */
    protected _configManager: IConfigManager | null;
    /**
     * Stores all the service providers of the application.
     *
     * @var object
     */
    protected _services: KeyValue<ClassOf<IServiceProvider>>;
    /**
     * Stores the alias of all the registered service providers.
     *
     * @var array
     */
    protected _loadedServices: KeyValue<IServiceProvider>;
    /**
     * Stores the alias of all the deferred services, which can be loaded
     * later.
     *
     * @var array
     */
    protected _deferredServices: string[];
    /**
     * Creates a new singleton Laress Application. This class acts as a container
     * where other instances/objects can be mount. The laress server has to be started
     * using startApp method of this class.
     *
     * Before starting the app, a rootpath has to be set.
     */
    constructor(rootPath: string);
    /**
     * Registers this app and and config bindings to the container.
     * Also sets the container instance to this object.
     */
    private registerBaseBindings;
    /**
     * Registers the configuration manager on the app instance. Configuration
     * manager is reponsible for handling the different configuration files.
     *
     * @return IConfigManager
     */
    private registerConfigManager;
    /**
     * Registers the necessary service providers. Deferred services are
     * cached in the deferred providers list and are loaded only when a
     * binding request is made to the service.
     */
    register(): void;
    /**
     * Registers a service if it is not a deferrable service and boots the
     * same if the app is already booted.
     *
     * @param name
     * @param serviceProvider
     */
    registerService(name: string, serviceProvider: IServiceProvider): void;
    /**
     * Registers a particular service of the given name.
     *
     * @param name
     */
    registerServiceByName(name: string): void;
    /**
     * Checks if a service by this name is already loaded.
     *
     * @param name
     */
    isServiceLoaded(name: string): boolean;
    /**
     * Checks if the service is a deferred.
     *
     * @param name
     */
    isDeferredService(name: string): boolean;
    /**
     * Boots the necessary service providers and boots each one of them.
     * Once that is done, we will update the application booted status. We will register
     * this service provider, if it is not registered yet.
     */
    boot(): void;
    /**
     * Boots a service provider. If the service is not already registered,
     * it is registered first, before performing the boot.
     *
     * @param service
     */
    bootService(service: IServiceProvider): void;
    /**
     * Starts the server after registering service providers and listen
     * for requests.
     */
    startApp(): void;
    initDbConnection(): Promise<any>;
    /**
     * Request handler. When a new request is received by the core http module,
     * it will send it to this handler. From here, we will pass it to the router.
     *
     * @param req
     * @param res
     */
    listenRequests(req: IncomingMessage, res: ServerResponse): void;
    /**
     * Creates an http server and listens on the port specified in the app
     * configuration file.
     *
     * @return this
     */
    enableHttpServer(): IApp;
    /**
     * Creates an https server and listens on the secure_port defined in the
     * app configuration. Creating an https server also requires providing certificate
     * file paths to the
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
     * Returns a configuration data for the key.
     *
     * @param key
     * @param defaultValue
     */
    config<T>(key: string, defaultValue?: T): T | null;
    /**
     * Sets the registration status of this service provider
     *
     * @param status
     */
    setRegistered(status: boolean): void;
    /**
     * Sets the boot status of this service provider
     *
     * @param status
     */
    setBooted(status: boolean): void;
    /**
     * Register status of this service provider
     *
     * @return boolean
     */
    isRegistered(): boolean;
    /**
     * Boot status of this service provider
     *
     * @return boolean
     */
    isBooted(): boolean;
    /**
     * Gets the root path of the application
     *
     * @return string
     */
    getRootPath(): string;
    /**
     * Returns the asset path of the application
     *
     * @return string
     */
    getAssetPath(): string;
    /**
     * Returns the laress binding of the specified key. If a binding is not
     * found, we will check for any deferred services and register if one exist.
     * Then we will try to get the binding once again.
     *
     * @param key The binding key to retreive
     * @param defaultValue The default value to return, if no bindings found
     */
    get<T>(key: string, defaultValue?: T | null): T | null;
}
export default Application;
