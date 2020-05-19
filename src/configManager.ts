import fs from "fs";
import path from "path";
import { Str } from "@rheas/support";
import { AnyObject } from "@rheas/contracts";
import { IManager } from "@rheas/contracts/core";

export class ConfigManager implements IManager {

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
     * Keeps an array of cached file names.
     * 
     * @var array
     */
    private _cachedFiles: string[] = [];

    constructor(_path: string) {
        this._path = Str.trimEnd(_path, path.sep);
    }

    /**
     * Gets the application configurations. Configs are requested
     * in filename.config format Config can be chained multiple times.
     * 
     * @param key
     */
    public get(key: string): any {

        // Return null if the key is null|undefined or the
        // trimmed key length is 0.
        if (key == null || (key = key.trim()).length <= 0) {
            return null;
        }

        // Splits the key by '.' character. Configs are requested using
        // filename.config format.
        const [filename, ...configKeys] = key.split('.');
        let config = null;

        // Check if the file is already cached or not. If not, we will try to
        // cache the file first. Only if file cache is successfull, we will check
        // for the configuration data.
        if (this.isCachedFile(filename) || this.cacheFile(filename)) {
            config = configKeys.reduce(
                (prev: any, current: any) => (prev && prev[current]) ? prev[current] : null,
                this._configs[filename]
            );
        }

        return config;
    }

    /**
     * Caches all the configuration data in the file
     * 
     * @param filename 
     */
    private cacheFile(filename: string) {
        const filePath = this.getFilePath(filename);

        if (!this.configFileExists(filePath)) {
            return null;
        }
        this._configs[filename] = require(filePath).default;

        return this._cachedFiles.push(filename);
    }

    /**
     * Returns the whole filePath
     * 
     * @param filename 
     */
    private getFilePath(filename: string): string {
        return `${this._path + path.sep + filename}.js`;
    }

    /**
     * Checks if a file name is cached or not.
     * 
     * @return boolean
     */
    private isCachedFile(filename: string): boolean {
        return this._cachedFiles.includes(filename);
    }

    /**
     * Checks if a config file exists or not.
     * 
     * @param filename 
     */
    private configFileExists(filePath: string): boolean {
        try {
            return fs.lstatSync(filePath).isFile();
        }
        // lstatSync throws an error if the file does not exists. 
        catch (err) { return false; }
    }
}