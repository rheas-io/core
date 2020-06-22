"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var Env = /** @class */ (function () {
    /**
     * Creates a new environment variable handler.
     *
     * @param rootPath
     */
    function Env(rootPath, file, encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        /**
         * Caches environment variables
         *
         * @var StringObject
         */
        this._envVariables = null;
        this._file = file;
        this._encoding = encoding;
        this._envFilePath = path_1.default.resolve(rootPath, '..', '.env');
    }
    /**
     * Gets the environment variable from the file.
     *
     * @param key
     * @param defaultValue
     */
    Env.prototype.get = function (key, defaultValue) {
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
    Env.prototype.getEnvVariables = function () {
        if (this._envVariables === null) {
            this._envVariables = this.readEnvFile();
        }
        return this._envVariables;
    };
    /**
     * Updates the application environment variable cache facilitating
     * syncing of .env file changes.
     */
    Env.prototype.updateCache = function () {
        this._envVariables = this.readEnvFile();
    };
    /**
     * Reads the environment file if it exists and parses into
     * a key value format
     *
     * @return object
     */
    Env.prototype.readEnvFile = function () {
        if (!this._file.exists(this._envFilePath)) {
            return {};
        }
        try {
            var fileContents = fs_1.default.readFileSync(this._envFilePath, { encoding: this._encoding });
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
    Env.prototype.parseContents = function (contents) {
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
    return Env;
}());
exports.Env = Env;
