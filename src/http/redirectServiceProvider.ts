import { Redirector } from "./redirector";
import { IRequest } from "@rheas/contracts";
import { IApp } from "@rheas/contracts/core";
import { IUrlGenerator } from "@rheas/contracts/routes";
import { DeferredServiceProvider } from "../deferredServiceProvider";

export class RedirectServiceProvider extends DeferredServiceProvider {

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
}
