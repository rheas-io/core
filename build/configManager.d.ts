import { IManager } from "@laress/contracts/core";
export declare class ConfigManager implements IManager {
    /**
     * Configuration folder path
     *
     * @var string
     */
    private _path;
    /**
     * Caches all the app configurations.
     *
     * @var object
     */
    private _configs;
    /**
     * Keeps an array of cached file names.
     *
     * @var array
     */
    private _cachedFiles;
    constructor(_path: string);
    /**
     * Gets the application configurations. Configs are requested
     * in filename.config format Config can be chained multiple times.
     *
     * If no configuration is found, a default value or null is returned.
     *
     * @param key
     * @param defaultValue
     */
    get<T>(key: string, defaultValue?: T | null): T | null;
    /**
     * Caches all the configuration data in the file
     *
     * @param filename
     */
    private cacheFile;
    /**
     * Returns the whole filePath
     *
     * @param filename
     */
    private getFilePath;
    /**
     * Checks if a file name is cached or not.
     *
     * @return boolean
     */
    private isCachedFile;
    /**
     * Checks if a config file exists or not.
     *
     * @param filename
     */
    private configFileExists;
}
