import { ServiceProvider } from "../serviceProvider";
import { IDeferredService } from "@rheas/contracts/services";
export declare class RedirectServiceProvider extends ServiceProvider implements IDeferredService {
    /**
     * Registers the redirect service when requested.
     */
    register(): void;
    /**
     * The service will be created only if requested by this name.
     *
     * @returns string
     */
    provide(): string;
}
