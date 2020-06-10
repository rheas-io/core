import { IContainer } from "@rheas/contracts/container";
import { IServiceProvider } from "@rheas/contracts/services";
export declare class ServiceProvider implements IServiceProvider {
    /**
     * Stores the container instance
     *
     * @var IContainer
     */
    protected container: IContainer;
    /**
     * Name by which the service is registered on the
     * config files.
     *
     * @var string
     */
    protected _name: string;
    /**
     * Registered status of the provider.
     *
     * @var boolean
     */
    protected _registered: boolean;
    /**
     * Boot status of the provider
     *
     * @var boolean
     */
    protected _booted: boolean;
    /**
     * Creates a new service provider
     *
     * @param name
     * @param container
     */
    constructor(name: string, container: IContainer);
    /**
     * Register the service within this function. Referencing other services
     * within this function should be done carefully. It could be possible that
     * referencing service is not registered yet. So proper validation is needed, if
     * referencing other services.
     *
     * And, referencing other service which inturn reference this service could produce
     * an infinite loop.
     */
    register(): void;
    /**
     * Boots the service provider. All the other registered services will be available
     * inside this function.
     */
    boot(): void;
    /**
     * Sets the registration status of this service provider.
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
     * Returns the registration status of this service provider.
     *
     * @return boolean
     */
    isRegistered(): boolean;
    /**
     * Returns the boot status of this service provider.
     *
     * @return boolean
     */
    isBooted(): boolean;
    /**
     * Returns the name of the service.
     *
     * @return string
     */
    serviceName(): string;
}
