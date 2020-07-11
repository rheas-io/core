"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var support_1 = require("@rheas/support");
var helpers_1 = require("@rheas/support/helpers");
var ConfigManager = /** @class */ (function () {
    /**
     * Creates a config manager that is responsible for reading
     * app configurations.
     *
     * @param _path
     */
    function ConfigManager(_path) {
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
    ConfigManager.prototype.get = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        // Return null if the key is null|undefined or the
        // trimmed key length is 0.
        if (key == null || (key = key.trim()).length <= 0) {
            return defaultValue;
        }
        // Splits the key by '.' character. Configs are requested using
        // filename.config format.
        var filename = key.split('.')[0];
        var config = null;
        // Check if the file is already cached or not. If not, we will try to
        // cache the file first. Only if file cache is successfull, we will check
        // for the configuration data.
        if (this.isCachedFile(filename) || this.cacheFile(filename)) {
            config = support_1.Obj.get(this._configs, key);
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
        this._configs[filename] = helpers_1.files().readJsFile(filePath);
    };
    /**
     * Returns the whole filePath
     *
     * @param filename
     */
    ConfigManager.prototype.getFilePath = function (filename) {
        return path_1.default.resolve(this._path, filename + ".js");
    };
    /**
     * Checks if a file name is cached or not.
     *
     * @return boolean
     */
    ConfigManager.prototype.isCachedFile = function (filename) {
        return this._configs[filename] != null;
    };
    return ConfigManager;
}());
exports.ConfigManager = ConfigManager;
