import { DeferredServiceProvider } from "@rheas/services";
export declare class RedirectServiceProvider extends DeferredServiceProvider {
    /**
     * As this is a deferred service, redirector will be registerd only
     * when the service is requested.
     */
    register(): void;
}
