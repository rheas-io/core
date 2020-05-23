import { ServiceProvider } from "../serviceProvider";
import { IDeferredService } from "@rheas/contracts/services";
export declare class RedirectServiceProvider extends ServiceProvider implements IDeferredService {
    /**
     * As this is a deferred service, redirector will be registerd only
     * when the service is requested.
     */
    register(): void;
    /**
     * The service will be created only if requested by this name.
     *
     * @returns string
     */
    provide(): string;
}
