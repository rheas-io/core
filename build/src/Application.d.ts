import { IConfig } from "@laress/contracts/core";
import { ApplicationBase } from "./ApplicationBase";
export default class Application extends ApplicationBase {
    /**
     * Stores the root path of the application. This root path is necessary
     * to load different modules of the application.
     */
    protected rootPath: string;
    /**
     * Holds all the configuration of this app. The project root
     * directory should have config.ts file defined, exporting all
     * the app configurations.
     */
    protected configObject: IConfig;
    constructor(rootPath: string);
    /**
     * @inheritdoc
     */
    boot(): void;
    /**
     * @inheritdoc
     */
    config(key: string): void;
    /**
     * @inheritdoc
     */
    getConfigurations(): IConfig;
    /**
     * @inheritdoc
     */
    getRootPath(): string;
    /**
     * @inheritdoc
     * //TODO read asset path from config, or a property with setter
     * and getter that can be set in the extended class
     */
    getAssetPath(): string;
}
