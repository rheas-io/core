import { files } from '@rheas/support/helpers';
import { IGetter } from '@rheas/contracts/core';
import { StringObject } from '@rheas/contracts';
import { IFileManager } from '@rheas/contracts/files';

export class EnvManager implements IGetter {
    /**
     * The environment file path
     *
     * @var string
     */
    protected _envFilePath: string;

    /**
     * env file encoding, default is utf8
     *
     * @var string
     */
    protected _encoding: string;

    /**
     * Caches environment variables
     *
     * @var StringObject
     */
    protected _envVariables: StringObject | null = null;

    /**
     * Creates a new environment variable handler.
     *
     * @param envPath
     */
    constructor(envPath: string, encoding = 'utf8') {
        this._encoding = encoding;
        this._envFilePath = envPath;
    }

    /**
     * Gets the environment variable from the file.
     *
     * @param key
     * @param defaultValue
     */
    public get(key: string, defaultValue: any = ''): any {
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
    public getEnvVariables(): StringObject {
        if (this._envVariables === null) {
            this._envVariables = this.readEnvFile();
        }
        return this._envVariables;
    }

    /**
     * Updates the application environment variable cache facilitating
     * syncing of .env file changes.
     */
    public updateCache(): void {
        this._envVariables = this.readEnvFile();
    }

    /**
     * Reads the environment file if it exists and parses into
     * a key value format
     *
     * @return object
     */
    protected readEnvFile(): StringObject {
        const fs: IFileManager = files();

        try {
            const fileContents = fs.readTextFileSync(this._envFilePath, this._encoding);

            return this.parseContents(fileContents);
        } catch (error) {}

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
    private parseContents(contents: string): StringObject {
        const parsed: StringObject = {};

        const RE_KEY_VAL_MATCH = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
        const RE_NEWLINES = /\\n/g;
        const NEWLINES_MATCH = /\n|\r|\r\n/;

        // Split the whole string by lines using the NEWLINES_MATCH
        // regex. Then iterate through all the lines and match the
        // line for a key=value format, if found add it to the result
        // object.
        contents
            .toString()
            .split(NEWLINES_MATCH)
            .forEach(function (line) {
                const keyValueArr = line.match(RE_KEY_VAL_MATCH);

                if (keyValueArr === null) {
                    return;
                }
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
