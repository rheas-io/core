"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const support_1 = require("@rheas/support");
const helpers_1 = require("@rheas/support/helpers");
class ConfigManager {
    /**
     * Creates a config manager that is responsible for reading
     * app configurations.
     *
     * @param _path
     */
    constructor(_path) {
        /**
         * Caches all the app configurations.
         *
         * @var object
         */
        this._configs = {};
        this._path = _path;
    }
    /**
     * Gets the application configurations. Configs are requested
     * in filename.config format Config can be chained multiple times.
     *
     * @param key
     */
    get(key, defaultValue = null) {
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
            config = support_1.Obj.get(this._configs, key);
        }
        return config == null ? defaultValue : config;
    }
    /**
     * Caches all the configuration data in the file
     *
     * @param filename
     */
    cacheFile(filename) {
        const filePath = this.getFilePath(filename);
        this._configs[filename] = helpers_1.files().readJsFile(filePath);
        return this.isCachedFile(filename);
    }
    /**
     * Returns the whole filePath
     *
     * @param filename
     */
    getFilePath(filename) {
        return path_1.default.resolve(this._path, `${filename}.js`);
    }
    /**
     * Checks if a file name is cached or not.
     *
     * @return boolean
     */
    isCachedFile(filename) {
        return this._configs[filename] != null;
    }
}
exports.ConfigManager = ConfigManager;
