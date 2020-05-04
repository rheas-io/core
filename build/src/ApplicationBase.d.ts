/// <reference types="node" />
import { IConfig } from "@laress/contracts/core";
import { IApp } from "@laress/contracts/core/app";
import { IncomingMessage, ServerResponse } from "http";
/**
 *
 */
export declare abstract class ApplicationBase implements IApp {
    /**
     * Sets the application boot status
     */
    protected booted: boolean;
    /**
     * Certain middlewares and route registers has to be
     * called before listening to requests. This method allows the users
     * to have their own middlewares by overriding.
     *
     * Note: Function override should mind the statement execution order.
     * These are all mostly middleware registrations, so changing the order
     * will affect the behaviour of application.
     */
    abstract boot(): void;
    /**
     *
     * @param key
     */
    abstract config(key: string): any;
    /**
     * Returns the complete app configuration object.
     *
     * @return IConfig
     */
    abstract getConfigurations(): IConfig;
    /**
     * Returns the application root path
     *
     * @return string
     */
    abstract getRootPath(): string;
    /**
     * Returns the application asset path
     *
     * @return string
     */
    abstract getAssetPath(): string;
    /**
     * Returns the boot status of this application
     *
     * @return boolean
     */
    isBooted(): boolean;
    /**
     *
     * @param req
     * @param res
     */
    protected requestHandler(req: IncomingMessage, res: ServerResponse): void;
    /**
     * Starts the express aplication and listen for requests
     * from clients on the port defined in the configuration.
     */
    startApp(): void;
    /**
     * Reads the app db configuration and connect using the
     * connector specified in the configuration. Override this
     * function if the user don't want to use the connector given in the
     * config file.
     */
    protected initDbConnection(): Promise<any>;
    /**
     * Initiate server to listen to client requests. This
     * function listens to a port on the server.
     */
    private listenRequests;
    /**
     * Convert port inputs into an integer value
     *
     * @param val Port value
     */
    private normalizePort;
    /**
     * Error callback to show pretty human readable
     * error message.
     *
     * @param error
     */
    private onError;
    /**
     * Server connection success callback. Log the connection
     * success messages.
     */
    private onListening;
}
