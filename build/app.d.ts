/// <reference types="node" />
import { Container } from "./container";
import { IApp } from "@laress/contracts/core/app";
import { IServiceManager } from "@laress/contracts/services";
import { IManager } from "@laress/contracts/core";
import { IncomingMessage, ServerResponse } from "http";
export declare class Application extends Container implements IApp {
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
     * Creates a new singleton Laress Application. This class acts as a container
     * where other instances/objects can be mount. The laress server has to be started
     * using startApp method of this class.
     *
     * Before starting the app, a rootpath has to be set.
     *
     * Registers the core app managers, ConfigManager and ServiceManager that handles configs
     * and serviceProviders respectively.
     */
    constructor(rootPath: string);
    /**
     * Registers this app and and config bindings to the container.
     * Also sets the container instance to this object.
     */
    protected registerBaseBindings(): void;
    /**
     * Registers the configuration manager on the app instance. Configuration
     * manager is reponsible for handling the different configuration files.
     *
     * @return IConfigManager
     */
    private registerConfigManager;
    /**
     * Starts the server after registering service providers and listen
     * for requests.
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
     * Returns a configuration data for the key.
     *
     * @param key
     * @param defaultValue
     */
    config<T>(key: string, defaultValue?: T | null): T | null;
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
     * @override Container getter
     *
     * Returns the laress binding of the specified key. If a binding is not
     * found, we will check for any deferred services and register if one exist.
     * Then we will try to get the binding once again.
     *
     * @param key The binding key to retreive
     * @param defaultValue The default value to return, if no bindings found
     */
    get<T>(key: string, defaultValue?: T | null): T | null;
}
