import { ClassOf, KeyValue } from "@laress/contracts";
import { IServiceManager, IServiceProvider } from "@laress/contracts/services";
export declare class ServiceManager implements IServiceManager {
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
     * Stores the alias of all the deferred services, which can be loaded
     * later.
     *
     * @var array
     */
    protected _deferredServices: string[];
    constructor(providers: KeyValue<ClassOf<IServiceProvider>>);
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
     * Loads a deferred service.
     *
     * @param key
     */
    loadDeferredService(key: string): boolean;
    /**
     * Checks if the service is a deferred.
     *
     * @param name
     */
    isDeferredService(name: string): boolean;
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
