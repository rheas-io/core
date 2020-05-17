import { ClassOf, KeyValue } from "@rheas/contracts";
import { IContainer } from "@rheas/contracts/container";
import { IServiceManager, IServiceProvider } from "@rheas/contracts/services";

export class ServiceManager implements IServiceManager {

    /**
     * The app container instance which has to be used when resolving
     * services.
     * 
     * @var IContainer
     */
    protected _container: IContainer;

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
     * 
     * @param container 
     * @param providers 
     */
    constructor(container: IContainer, providers: KeyValue<ClassOf<IServiceProvider>> = {}) {
        this._container = container;
        this._services = providers;
    }

    /**
     * Sets the service providers handled by this manager. Services are not updated
     * if the manager is already booted.
     * 
     * @param providers 
     */
    public setProviders(providers: KeyValue<ClassOf<IServiceProvider>>): void {
        if (this.isBooted()) {
            return;
        }
        this._services = providers;
    }

    /**
     * Registers the necessary service providers. Deferred services are
     * cached in the deferred providers list and are loaded only when a 
     * binding request is made to the service.
     */
    public register(): void {
        if (this.isRegistered()) {
            return;
        }

        for (let alias in this._services) {
            const service = this._services[alias];
            // A service can be deferred to load when it is absolutely needed.
            // Such services should have a provides property that states, to which
            // alias it should be loaded.
            if ('provide' in service && !this._deferredServices.includes(alias)) {
                this._deferredServices.push(name);
            }
            // If the service doesn't has to be deferred, we will register
            // them immediately.
            else {
                this.registerService(name, new service(this._container));
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
            this.registerService(name, new service(this._container));
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
     * Loads a deferred service.
     * 
     * @param key 
     */
    public loadDeferredService(key: string): boolean {

        if (this.isDeferredService(key)) {
            this.registerServiceByName(key);

            return true;
        }
        return false;
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
     * Registers the necessary service providers, if it is not already
     * registered and boots each one of them. Once that is done, we will 
     * update the boot status.
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
}