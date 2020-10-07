import { MixHandler } from './mixHandler';
import { FileManager } from '@rheas/files';
import { IApp } from '@rheas/contracts/core';
import { ServiceProvider } from '@rheas/services';
import { InstanceHandler } from '@rheas/contracts/container';

export class MixServiceProvider extends ServiceProvider {
    /**
     * Returns a new mix handler which reads mix-manifest.json file from the
     * assets dir and return the actual path to assets.
     *
     * We are using a mix service provider, so that developers can remove them
     * if not needed.
     *
     * @returns
     */
    public serviceResolver(): InstanceHandler {
        return (app) => new MixHandler((app as IApp).path('assets'), new FileManager());
    }
}
