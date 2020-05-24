import { ClassOf, KeyValue } from "@rheas/contracts";
import { IContainer } from "@rheas/contracts/container";
import { IServiceManager, IServiceProvider } from "@rheas/contracts/services";
export declare class ServiceManager implements IServiceManager {
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
    protected _booted: boolean;
    /**
     * Stores the registration status of this service provider.
     *
     * @var boolean
     */
    protected _registered: boolean;
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
     *
     * @param container
     * @param providers
     */
    constructor(container: IContainer, providers?: KeyValue<ClassOf<IServiceProvider>>);
    /**
     * Sets the service providers handled by this manager. Services are not updated
     * if the manager is already registered.
     *
     * @param providers
     */
    setProviders(providers: KeyValue<ClassOf<IServiceProvider>>): void;
    /**
     * @inheritdoc
     *
     * @param name
     * @param provider
     */
    newService(name: string, provider: ClassOf<IServiceProvider>): IServiceManager;
    /**
     * Registers the necessary service providers. Deferred services are
     * cached in the deferred providers list and are loaded only when a
     * binding request is made to the service.
     */
    register(): void;
    /**
     * Registers a particular service of the given name.
     *
     * @param name
     */
    registerServiceByName(name: string): boolean;
    /**
     * Checks if a service by this name is already loaded.
     *
     * @param name
     */
    isServiceLoaded(name: string): boolean;
    /**
     * Registers the necessary service providers, if it is not already
     * registered and boots each one of them. Once that is done, we will
     * update the boot status.
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
}
