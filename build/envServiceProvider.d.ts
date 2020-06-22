import { ServiceProvider } from "./serviceProvider";
export declare class EnvServiceProvider extends ServiceProvider {
    /**
     * Registers the .env file reader service.
     *
     * The service will be responsible for creating, updating
     * any environment variables. Also has a function to update
     * the cached variable, so that environment var updates are
     * synced.
     */
    register(): void;
}
