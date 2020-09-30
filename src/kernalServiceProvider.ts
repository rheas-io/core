import { Kernal } from './kernal';
import { IApp } from '@rheas/contracts/core';
import { ServiceProvider } from '@rheas/services';
import { InstanceHandler } from '@rheas/contracts/container';

export class KernalServiceProvider extends ServiceProvider {
    /**
     * Returns the application request kernal which is responsible
     * for serving each request. It serves static files if exists or
     * routes the request to router and takes care of exceptions during the
     * request pipeline flow.
     *
     * @returns
     */
    public serviceResolver(): InstanceHandler {
        return (app) => new Kernal(app as IApp, app.get('middlewares'));
    }
}
