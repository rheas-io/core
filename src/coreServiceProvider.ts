import { IApp } from '@rheas/contracts/core';
import { AnyObject } from '@rheas/contracts';
import * as helpers from '@rheas/support/helpers';
import { ServiceProvider } from '@rheas/services';
import { IViewFactory } from '@rheas/contracts/views';
import * as mailHelpers from '@rheas/support/helpers/mail';
import * as fileHelpers from '@rheas/support/helpers/files';
import { InstanceHandler } from '@rheas/contracts/container';
import * as errorHelpers from '@rheas/support/helpers/exception';

export class CoreServiceProvider extends ServiceProvider {
    /**
     * Registers the applications core service. The application instance
     * will be bind to the service name.
     */
    public serviceResolver(): InstanceHandler {
        return (app) => app;
    }

    /**
     * Register the app level settings in here. 
     * 
     * Share the app helper functions on all the views. Preceede all the functions with
     * double underscore to eliminate override of these with data shared with each
     * view.
     */
    public boot(): void {
        const view: IViewFactory = (this.container as IApp).get('view');

        const helperFuncs: AnyObject = Object.assign(
            {},
            helpers,
            mailHelpers,
            fileHelpers,
            errorHelpers,
        );

        Object.keys(helperFuncs).forEach((key) => view.share('__' + key, helperFuncs[key]));
    }
}
