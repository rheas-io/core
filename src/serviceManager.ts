import { ClassOf, KeyValue } from "@rheas/contracts";
import { IContainer } from "@rheas/contracts/container";
import { IServiceManager, IServiceProvider } from "@rheas/contracts/services";
import { InvalidArgumentException } from "./errors";

export class ServiceManager implements IServiceManager {

    /**
     * The container instance which has to be used when resolving
     * services. This can be either App or Request instance.
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
     * if the manager is already registered.
     * 
     * @param providers 
     */
    public setProviders(providers: KeyValue<ClassOf<IServiceProvider>>): void {
        if (this.isRegistered()) {
            return;
        }
        this._services = providers;
    }

    /**
     * @inheritdoc
     * 
     * @param name 
     * @param provider 
     */
    public newService(name: string, provider: ClassOf<IServiceProvider>): IServiceManager {

        if (this.isServiceLoaded(name)) {
            throw new InvalidArgumentException(
                `A service ${name} is already loaded/registered. Check the app/request configuration files for 
                service provider list.`
            );
        }
        this._services[name] = provider;

        // No need to register the service as it will be registered and booted
        // when it is required.
        
        return this;
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
            // A service can be deferred to load when it is absolutely needed.
            // Such services should have a provides property that states, to which
            // alias it should be loaded.
            //
            // If the service doesn't has to be deferred, we will register
            // them immediately.
            if (!('provide' in this._services[alias])) {
                this.registerServiceByName(alias);
            }
        }
        this.setRegistered(true);
    }

    /**
     * Registers a particular service of the given name.
     * 
     * @param name 
     */
    public registerServiceByName(name: string): boolean {
        // Return false if the service is already loaded or service
        // is not a class 
        if (this.isServiceLoaded(name)) {
            return false;
        }

        const service: ClassOf<IServiceProvider> = this._services[name];
        const serviceProvider = new service(this._container);

        serviceProvider.register();
        serviceProvider.setRegistered(true);

        this._loadedServices[name] = serviceProvider;

        if (this.isBooted()) {
            this.bootService(serviceProvider);
        }

        return true;
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