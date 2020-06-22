import { StringObject } from "@rheas/contracts";
import { IFiles } from "@rheas/contracts/files";
import { IManager } from "@rheas/contracts/core";
export declare class Env implements IManager {
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
     * The system file handler
     *
     * @var IFiles
     */
    protected _file: IFiles;
    /**
     * Caches environment variables
     *
     * @var StringObject
     */
    protected _envVariables: StringObject | null;
    /**
     * Creates a new environment variable handler.
     *
     * @param rootPath
     */
    constructor(rootPath: string, file: IFiles, encoding?: string);
    /**
     * Gets the environment variable from the file.
     *
     * @param key
     * @param defaultValue
     */
    get(key: string, defaultValue?: any): any;
    /**
     * Get the application env variables.
     *
     * @returns
     */
    getEnvVariables(): StringObject;
    /**
     * Updates the application environment variable cache facilitating
     * syncing of .env file changes.
     */
    updateCache(): void;
    /**
     * Reads the environment file if it exists and parses into
     * a key value format
     *
     * @return object
     */
    protected readEnvFile(): StringObject;
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
    private parseContents;
}