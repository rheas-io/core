import path from 'path';
import { Obj } from '@rheas/support/obj';
import { AnyObject } from '@rheas/contracts';
import { files } from '@rheas/support/helpers';
import { IGetter } from '@rheas/contracts/core';

export class ConfigManager implements IGetter {
    /**
     * Configuration folder path
     *
     * @var string
     */
    private _path: string;

    /**
     * Caches all the app configurations.
     *
     * @var object
     */
    private _configs: AnyObject = {};

    /**
     * Creates a config manager that is responsible for reading
     * app configurations.
     *
     * @param _path
     */
    constructor(_path: string) {
        this._path = _path;
    }

    /**
     * Gets the application configurations. Configs are requested
     * in filename.config format Config can be chained multiple times.
     *
     * @param key
     */
    public get(key: string, defaultValue: any = null): any {
        // Return null if the key is null|undefined or the
        // trimmed key length is 0.
        if (key == null || (key = key.trim()).length <= 0) {
            return defaultValue;
        }

        // Splits the key by '.' character. Configs are requested using
        // filename.config format.
        const filename = key.split('.')[0];
        let config = null;

        // Check if the file is already cached or not. If not, we will try to
        // cache the file first. Only if file cache is successfull, we will check
        // for the configuration data.
        if (this.isCachedFile(filename) || this.cacheFile(filename)) {
            config = Obj.get(this._configs, key);
        }

        return config == null ? defaultValue : config;
    }

    /**
     * Caches all the configuration data in the file
     *
     * @param filename
     */
    private cacheFile(filename: string): boolean {
        const filePath = this.getFilePath(filename);

        this._configs[filename] = files().readJsSync(filePath);

        return this.isCachedFile(filename);
    }

    /**
     * Returns the whole filePath
     *
     * @param filename
     */
    private getFilePath(filename: string): string {
        return path.resolve(this._path, `${filename}.js`);
    }

    /**
     * Checks if a file name is cached or not.
     *
     * @return boolean
     */
    private isCachedFile(filename: string): boolean {
        return this._configs[filename] != null;
    }
}
