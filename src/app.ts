import path from "path";
import { Str } from "@laress/support";
import { Container } from "./container";
import { ConfigManager } from "./configManager";
import { IApp } from "@laress/contracts/core/app";
import { KeyValue, ClassOf } from "@laress/contracts";
import { IncomingMessage, ServerResponse } from "http";
import { IServiceProvider, IConfigManager } from "@laress/contracts/core";

class Application extends Container implements IApp {

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
    protected _booted: boolean = false;

    /**
     * Stores the registration status of this service provider.
     * 
     * @var boolean
     */
    protected _registered: boolean = false;

    /**
     * Application configurations manager. Handles the parsing and retreival
     * of configuration files.
     * 
     * @var IConfigManager
     */
    protected _configManager: IConfigManager | null = null;

    /**
     * Stores all the service providers of the application.
     * 
     * @var object
     */
    protected _services: KeyValue<ClassOf<IServiceProvider>> = {};

    /**
     * Stores the alias of all the registered service providers.
     * 
     * @var array
     */
    protected _loadedServices: KeyValue<IServiceProvider> = {};

    /**
     * Stores the alias of all the deferred services, which can be loaded
     * later.
     * 
     * @var array
     */
    protected _deferredServices: string[] = [];

    /**
     * Creates a new singleton Laress Application. This class acts as a container
     * where other instances/objects can be mount. The laress server has to be started
     * using startApp method of this class.
     * 
     * Before starting the app, a rootpath has to be set.
     */
    private constructor(rootPath: string) {
        super();

        this._rootPath = rootPath;

        this.registerBaseBindings();
    }

    /**
     * Registers this app and and config bindings to the container.
     * Also sets the container instance to this object.
     */
    private registerBaseBindings() {

        Container.setInstance(this);

        this.singleton('app', () => this);

        this.singleton('config', () => this.registerConfigManager());
    }

    /**
     * Registers the configuration manager on the app instance. Configuration
     * manager is reponsible for handling the different configuration files.
     * 
     * @return IConfigManager
     */
    private registerConfigManager(): IConfigManager {
        const configPath = Str.trimEnd(this.getRootPath(), path.sep) + path.sep + this.get;

        this._configManager = new ConfigManager(configPath);

        return this._configManager;
    }

    /**
     * Registers the necessary service providers. Deferred services are
     * cached in the deferred providers list.
     */
    public register(): void {
        let providers: KeyValue<ClassOf<IServiceProvider>> | null = {};

        providers = this.config('app.providers', providers);

        for (let alias in providers) {
            const service = providers[alias];
            // A service can be deferred to load when it is absolutely needed.
            // Such services should have a provides property that states, to which
            // alias it should be loaded.
            if ('provides' in service && !this._deferredServices.includes(alias)) {
                this._deferredServices.push(name);
            }
            // If the service doesn't has to be deferred, we will register
            // them immediately.
            else {
                this.registerService(name, new service(this));
            }
        }
        this.setRegistered(true);
    }

    /**
     * Registers a service if it is not a deferrable service and boots the
     * same if the app is already booted.
     * 
     * @param name 
     * @param serviceProvider 
     */
    public registerService(name: string, serviceProvider: IServiceProvider): void {

        if (this.isServiceLoaded(name)) {
            throw new Error(`A service '${name}' is already registered. Refer the config/app file for all the services.`);
        }

        serviceProvider.register();
        serviceProvider.setRegistered(true);

        this._loadedServices[name] = serviceProvider;

        this._deferredServices = this._deferredServices.filter(serviceName => serviceName !== name);

        if (this.isBooted()) {
            this.bootService(serviceProvider);
        }
    }

    /**
     * Registers a particular service of the given name.
     * 
     * @param name 
     */
    public registerServiceByName(name: string) {
        if (this.isServiceLoaded(name)) {
            return;
        }
        const service: ClassOf<IServiceProvider> = this._services[name];

        if (service) {
            this.registerService(name, new service(this));
        }
    }

    /**
     * Checks if a service by this name is already loaded.
     * 
     * @param name 
     */
    public isServiceLoaded(name: string): boolean {
        return !!this._loadedServices[name];
    }

    /**
     * Checks if the service is a deferred.
     * 
     * @param name 
     */
    public isDeferredService(name: string): boolean {
        return this._deferredServices.includes(name);
    }

    /**
     * Boots the necessary service providers and boots each one of them.
     * Once that is done, we will update the application booted status. We will register
     * this service provider, if it is not registered yet.
     */
    public boot(): void {
        if (this.isBooted()) {
            return;
        }

        if (!this.isRegistered()) {
            this.register();
        }

        for (let alias in this._loadedServices) {
            this.bootService(this._loadedServices[alias]);
        }

        this.setBooted(true);
    }

    /**
     * Boots a service provider. If the service is not already registered,
     * it is registered first, before performing the boot.
     * 
     * @param service 
     */
    public bootService(service: IServiceProvider): void {

        if (service.isBooted()) {
            return;
        }

        if (!service.isRegistered()) {
            service.register();
        }
        service.boot();
        service.setBooted(true);
    }

    /**
     * Starts the server after registering service providers and listen
     * for requests.
     */
    public startApp(): void {

        // Boot the application before starting the server
        this.boot();

        // Establish connection to the database before opening a 
        // port. On successfull connection, open a port and listen to
        // requests. Otherwise, log the error and exit the process.
        this.initDbConnection()
            //.then(() => this.listenRequests())
            .catch(error => {
                console.error("Error connecting to database. Server not started.");
                console.error(error);
                process.exit(1);
            });
    }

    public initDbConnection(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public listenRequests(req: IncomingMessage, res: ServerResponse): void {
        throw new Error("Method not implemented.");
    }

    public enableHttpsServer(): IApp {
        throw new Error("Method not implemented.");
    }

    /**
     * Returns a configuration data for the key.
     * 
     * @param key 
     * @param defaultValue 
     */
    public config<T>(key: string, defaultValue?: T): T | null {
        if (this._configManager == null) {
            this._configManager = this.registerConfigManager();
        }

        return this._configManager.get(key, defaultValue);
    }

    /**
     * Sets the registration status of this service provider
     * 
     * @param status 
     */
    public setRegistered(status: boolean): void {
        this._registered = status;
    }

    /**
     * Sets the boot status of this service provider
     * 
     * @param status 
     */
    public setBooted(status: boolean): void {
        this._booted = status;
    }

    /**
     * Register status of this service provider
     * 
     * @return boolean
     */
    public isRegistered(): boolean {
        return this._registered;
    }

    /**
     * Boot status of this service provider
     * 
     * @return boolean
     */
    public isBooted(): boolean {
        return this._booted;
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
     * Returns the laress binding of the specified key. If a binding is not
     * found, we will check for any deferred services and register if one exist.
     * Then we will try to get the binding once again.
     * 
     * @param key The binding key to retreive
     * @param defaultValue The default value to return, if no bindings found
     */
    public get<T = any>(key: string, defaultValue?: T): T | null {
        const service = super.get(key, defaultValue);

        if (service === null && this.isDeferredService(key)) {
            this.registerServiceByName(key);

            return this.get(key, defaultValue);
        }
        return service;
    }
}

export default Application;
