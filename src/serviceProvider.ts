import { IApp } from "@laress/contracts/core/app";
import { IServiceProvider } from "@laress/contracts/services";

export class ServiceProvider implements IServiceProvider {

    /**
     * Stores the container instance
     * 
     * @var IApp
     */
    protected app: IApp;

    /**
     * Registered status of the provider.
     * 
     * @var boolean
     */
    protected _registered: boolean = false;

    /**
     * Boot status of the provider
     * 
     * @var boolean
     */
    protected _booted: boolean = false;

    constructor(container: IApp) {
        this.app = container;
    }

    /**
     * Register the service within this function. Referencing other services
     * within this function should be done carefully. It could be possible that
     * referencing service is not registered yet. So proper validation is needed, if
     * referencing other services.
     * 
     * And, referencing other service which inturn reference this service could produce
     * an infinite loop.
     */
    public register(): void {

    }

    /**
     * Boots the service provider. All the other registered services will be available
     * inside this function.
     */
    public boot(): void {

    }

    /**
     * Sets the registration status of this service provider.
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
     * Returns the registration status of this service provider.
     * 
     * @return boolean
     */
    public isRegistered(): boolean {
        return this._registered;
    }

    /**
     * Returns the boot status of this service provider.
     * 
     * @return boolean
     */
    public isBooted(): boolean {
        return this._booted;
    }
}