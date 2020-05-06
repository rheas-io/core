import { IApp } from "@laress/contracts/core/app";
import { IServiceProvider } from "@laress/contracts/core";

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
     * Register the service within this function. This function should
     * not reference other services because they may not be initialized yet.
     * So null check/exception capture is needed or use the boot function.
     */
    public register(): void {

    }

    /**
     * Boots the service provider. All the other services will be available
     * inside this function.
     */
    public boot(): void {

    }

    public setRegistered(status: boolean): void {
        this._registered = status;
    }

    public setBooted(status: boolean): void {
        this._booted = status;
    }

    public isRegistered(): boolean {
        return this._registered;
    }

    public isBooted(): boolean {
        return this._booted;
    }
}