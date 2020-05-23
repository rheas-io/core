import { Redirector } from "./redirector";
import { IRequest } from "@rheas/contracts";
import { ServiceProvider } from "../serviceProvider";
import { IDeferredService } from "@rheas/contracts/services";

export class RedirectServiceProvider extends ServiceProvider implements IDeferredService {

    /**
     * As this is a deferred service, redirector will be registerd only
     * when the service is requested.
     */
    public register() {
        this.container.singleton(this.provide(), (request) => {
            return new Redirector(<IRequest>request, request.get('response'));
        });
    }

    /**
     * The service will be created only if requested by this name.
     * 
     * @returns string
     */
    public provide(): string {
        return 'redirect';
    }
}