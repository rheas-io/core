import path from 'path';
import { Str } from '@rheas/support/str';
import { StringObject } from '@rheas/contracts';
import { IMixHandler } from '@rheas/contracts/core';
import { IFileManager } from '@rheas/contracts/files';

export class MixHandler implements IMixHandler {
    /**
     * Applications assets directory.
     *
     * @var string
     */
    protected _assetsDir: string;

    /**
     * Filemanager instance to read mix-manifest files.
     *
     * @var IFileManager
     */
    protected _fileManager: IFileManager;

    /**
     * Last modified time in ms of the mix-manifest.json file.
     *
     * @var number
     */
    protected _modifiedTime: number = new Date().valueOf();

    /**
     * Cache of manifest file.
     *
     * @var JsonObject
     */
    protected _cachedManifest: StringObject = {};

    /**
     * Creates a new mix manifest file reader.
     *
     * @param fileManager
     * @param assetsDir
     */
    constructor(assetsDir: string, fileManager: IFileManager) {
        this._assetsDir = assetsDir;
        this._fileManager = fileManager;
    }

    /**
     * Reads the mix-manifest.json file in the assets dir and parses it into
     * a JSON object.
     *
     * We will keep a cache of the file contents so that we don't have to parse the
     * file everytime, we need it.
     *
     * @returns
     */
    public manifest(): StringObject {
        const manifestPath = path.resolve(this._assetsDir, 'mix-manifest.json');

        try {
            const fileStats = this._fileManager.fileStatsSync(manifestPath);

            // Read manifest file and update the cache if the file last modified time does
            // not match with what we have cached.
            if (fileStats && fileStats.mtimeMs !== this._modifiedTime) {
                const manifestContent = this._fileManager.readTextFileSync(manifestPath);

                this._cachedManifest = JSON.parse(manifestContent);
                this._modifiedTime = fileStats.mtimeMs;
            }
        } catch (error) {}

        return this._cachedManifest;
    }

    /**
     * Returns the file path from the mix-manifest.json file.
     *
     * @param path
     */
    public get(path: string): string {
        const manifest = this.manifest();

        path = Str.path(path, true);

        // If manifest file does not contain the file details, return the path
        // itself. App will try to serve it from the assets folder and if it is
        // not found 404 will be returned to the client.
        if (!manifest.hasOwnProperty(path)) {
            return path;
        }
        return manifest[path];
    }
}
