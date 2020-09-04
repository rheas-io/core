import { Redirector } from './redirector';
import { IRequest } from '@rheas/contracts';
import { IApp } from '@rheas/contracts/core';
import { IUrlGenerator } from '@rheas/contracts/routes';
import { DeferredServiceProvider } from '@rheas/services';
import { InstanceHandler } from '@rheas/contracts/container';

export class RedirectServiceProvider extends DeferredServiceProvider {
    /**
     * Returns the redirector service resolver.
     *
     * @returns
     */
    public serviceResolver(): InstanceHandler {
        return (request) => {
            const app: IApp = request.get('app');
            const urlGenerator: IUrlGenerator = app.get('url');

            return new Redirector(urlGenerator, request as IRequest, request.get('response'));
        };
    }
}
