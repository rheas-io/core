"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var support_1 = require("@rheas/support");
var ConfigManager = /** @class */ (function () {
    function ConfigManager(_path) {
        /**
         * Caches all the app configurations.
         *
         * @var object
         */
        this._configs = {};
        /**
         * Keeps an array of cached file names.
         *
         * @var array
         */
        this._cachedFiles = [];
        this._path = support_1.Str.trimEnd(_path, path_1.default.sep);
    }
    /**
     * Gets the application configurations. Configs are requested
     * in filename.config format Config can be chained multiple times.
     *
     * If no configuration is found, a default value or null is returned.
     *
     * @param key
     * @param defaultValue
     */
    ConfigManager.prototype.get = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        // Return null if the key is null|undefined or the
        // trimmed key length is 0.
        if (key == null || (key = key.trim()).length <= 0) {
            return defaultValue;
        }
        // Splits the key by '.' character. Configs are requested using
        // filename.config format.
        var _a = key.split('.'), filename = _a[0], configKeys = _a.slice(1);
        var config = defaultValue;
        // Check if the file is already cached or not. If not, we will try to
        // cache the file first. Only if file cache is successfull, we will check
        // for the configuration data.
        if (this.isCachedFile(filename) || this.cacheFile(filename)) {
            config = configKeys.reduce(function (prev, current) { return (prev && prev[current]) ? prev[current] : null; }, this._configs[filename]);
        }
        return config == null ? defaultValue : config;
    };
    /**
     * Caches all the configuration data in the file
     *
     * @param filename
     */
    ConfigManager.prototype.cacheFile = function (filename) {
        var filePath = this.getFilePath(filename);
        if (!this.configFileExists(filePath)) {
            return null;
        }
        this._configs[filename] = require(filePath).default;
        return this._cachedFiles.push(filename);
    };
    /**
     * Returns the whole filePath
     *
     * @param filename
     */
    ConfigManager.prototype.getFilePath = function (filename) {
        return this._path + path_1.default.sep + filename + ".js";
    };
    /**
     * Checks if a file name is cached or not.
     *
     * @return boolean
     */
    ConfigManager.prototype.isCachedFile = function (filename) {
        return this._cachedFiles.includes(filename);
    };
    /**
     * Checks if a config file exists or not.
     *
     * @param filename
     */
    ConfigManager.prototype.configFileExists = function (filePath) {
        try {
            return fs_1.default.lstatSync(filePath).isFile();
        }
        // lstatSync throws an error if the file does not exists. 
        catch (err) {
            return false;
        }
    };
    return ConfigManager;
}());
exports.ConfigManager = ConfigManager;
