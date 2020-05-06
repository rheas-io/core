import { IApp } from "@laress/contracts/core/app";
import { IServiceProvider } from "@laress/contracts/core";
export declare class ServiceProvider implements IServiceProvider {
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
    protected _registered: boolean;
    /**
     * Boot status of the provider
     *
     * @var boolean
     */
    protected _booted: boolean;
    constructor(container: IApp);
    /**
     * Register the service within this function. This function should
     * not reference other services because they may not be initialized yet.
     * So null check/exception capture is needed or use the boot function.
     */
    register(): void;
    /**
     * Boots the service provider. All the other services will be available
     * inside this function.
     */
    boot(): void;
    setRegistered(status: boolean): void;
    setBooted(status: boolean): void;
    isRegistered(): boolean;
    isBooted(): boolean;
}
