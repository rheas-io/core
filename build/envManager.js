"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("@rheas/support/helpers");
class EnvManager {
    /**
     * Creates a new environment variable handler.
     *
     * @param envPath
     */
    constructor(envPath, encoding = 'utf8') {
        /**
         * Caches environment variables
         *
         * @var StringObject
         */
        this._envVariables = null;
        this._encoding = encoding;
        this._envFilePath = envPath;
    }
    /**
     * Gets the environment variable from the file.
     *
     * @param key
     * @param defaultValue
     */
    get(key, defaultValue = '') {
        const env = this.getEnvVariables();
        // env variables will have only string values, so it is
        // okay to check using OR operator
        return (env && env[key]) || defaultValue;
    }
    /**
     * Get the application env variables.
     *
     * @returns
     */
    getEnvVariables() {
        if (this._envVariables === null) {
            this._envVariables = this.readEnvFile();
        }
        return this._envVariables;
    }
    /**
     * Updates the application environment variable cache facilitating
     * syncing of .env file changes.
     */
    updateCache() {
        this._envVariables = this.readEnvFile();
    }
    /**
     * Reads the environment file if it exists and parses into
     * a key value format
     *
     * @return object
     */
    readEnvFile() {
        const fs = helpers_1.files();
        if (fs.fileExists(this._envFilePath)) {
            try {
                const fileContents = fs.readFileSync(this._envFilePath, this._encoding);
                return this.parseContents(fileContents);
            }
            catch (error) { }
        }
        return {};
    }
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
    parseContents(contents) {
        const parsed = {};
        const RE_KEY_VAL_MATCH = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
        const RE_NEWLINES = /\\n/g;
        const NEWLINES_MATCH = /\n|\r|\r\n/;
        // Split the whole string by lines using the NEWLINES_MATCH
        // regex. Then iterate through all the lines and match the
        // line for a key=value format, if found add it to the result
        // object.
        contents.toString().split(NEWLINES_MATCH).forEach(function (line) {
            const keyValueArr = line.match(RE_KEY_VAL_MATCH);
            if (keyValueArr === null) {
                return;
            }
            ;
            // keyValueArr will contain
            // [0] wholematch ie key=val
            // [1] key
            // [2] val
            const key = keyValueArr[1];
            let val = (keyValueArr[2] || '').trim();
            const end = val.length - 1;
            const isDoubleQuoted = val[0] === '"' && val[end] === '"';
            const isSingleQuoted = val[0] === "'" && val[end] === "'";
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
    }
}
exports.EnvManager = EnvManager;
