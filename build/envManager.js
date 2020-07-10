"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EnvManager = /** @class */ (function () {
    /**
     * Creates a new environment variable handler.
     *
     * @param envPath
     */
    function EnvManager(file, envPath, encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        /**
         * Caches environment variables
         *
         * @var StringObject
         */
        this._envVariables = null;
        this._file = file;
        this._encoding = encoding;
        this._envFilePath = envPath;
    }
    /**
     * Gets the environment variable from the file.
     *
     * @param key
     * @param defaultValue
     */
    EnvManager.prototype.get = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = ''; }
        var env = this.getEnvVariables();
        // env variables will have only string values, so it is
        // okay to check using OR operator
        return (env && env[key]) || defaultValue;
    };
    /**
     * Get the application env variables.
     *
     * @returns
     */
    EnvManager.prototype.getEnvVariables = function () {
        if (this._envVariables === null) {
            this._envVariables = this.readEnvFile();
        }
        return this._envVariables;
    };
    /**
     * Updates the application environment variable cache facilitating
     * syncing of .env file changes.
     */
    EnvManager.prototype.updateCache = function () {
        this._envVariables = this.readEnvFile();
    };
    /**
     * Reads the environment file if it exists and parses into
     * a key value format
     *
     * @return object
     */
    EnvManager.prototype.readEnvFile = function () {
        if (!this._file.fileExists(this._envFilePath)) {
            return {};
        }
        try {
            var fileContents = this._file.readFileSync(this._envFilePath, this._encoding);
            return this.parseContents(fileContents);
        }
        catch (error) { }
        return {};
    };
    /**
     * Parses a given env file content string to StringObject. The code is
     * taken from the dotenv package. Refer the dotenv repo at
     * https://github.com/motdotla/dotenv/blob/master/lib/main.js
     *
     * We don't want to add the env variables to process.env so avoided using the
     * whole package.
     *
     * @param contents
     */
    EnvManager.prototype.parseContents = function (contents) {
        var parsed = {};
        var RE_KEY_VAL_MATCH = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
        var RE_NEWLINES = /\\n/g;
        var NEWLINES_MATCH = /\n|\r|\r\n/;
        // Split the whole string by lines using the NEWLINES_MATCH
        // regex. Then iterate through all the lines and match the
        // line for a key=value format, if found add it to the result
        // object.
        contents.toString().split(NEWLINES_MATCH).forEach(function (line) {
            var keyValueArr = line.match(RE_KEY_VAL_MATCH);
            if (keyValueArr === null) {
                return;
            }
            ;
            // keyValueArr will contain
            // [0] wholematch ie key=val
            // [1] key
            // [2] val
            var key = keyValueArr[1];
            var val = (keyValueArr[2] || '').trim();
            var end = val.length - 1;
            var isDoubleQuoted = val[0] === '"' && val[end] === '"';
            var isSingleQuoted = val[0] === "'" && val[end] === "'";
            // if single or double quoted, remove quotes and replace
            // literal new line characters (\n) in the string with a 
            // new line character \n
            //
            // So characters \n in a .env value will be treated as a new 
            // line if the value is inside quotes.
            if (isSingleQuoted || isDoubleQuoted) {
                val = val.substring(1, end).replace(RE_NEWLINES, '\n');
            }
            parsed[key] = val;
        });
        return parsed;
    };
    return EnvManager;
}());
exports.EnvManager = EnvManager;
