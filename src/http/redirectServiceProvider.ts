import { Redirector } from "./redirector";
import { IRequest } from "@rheas/contracts";
import { IApp } from "@rheas/contracts/core";
import { ServiceProvider } from "../serviceProvider";
import { IUrlGenerator } from "@rheas/contracts/routes";
import { IDeferredService } from "@rheas/contracts/services";

export class RedirectServiceProvider extends ServiceProvider implements IDeferredService {

    /**
     * As this is a deferred service, redirector will be registerd only
     * when the service is requested.
     */
    public register() {
        this.container.singleton(this.serviceName(), (request) => {
            const app: IApp = request.get('app');
            const urlGenerator: IUrlGenerator = app.get('url');

            return new Redirector(urlGenerator, <IRequest>request, request.get('response'));
        });
    }

    /**
     * The service will be created only if requested by this name.
     * 
     * @returns string
     */
    public provide(): string {
        return this.serviceName();
    }
}
