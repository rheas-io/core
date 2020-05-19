/// <reference types="node" />
import { IncomingMessage } from "http";
import { IApp } from "@rheas/contracts/core";
import { IRequest, AnyObject } from "@rheas/contracts";
import { IServiceManager } from "@rheas/contracts/services";
import { IRequestComponent } from "@rheas/contracts/routes/uri";
import { IContainer, InstanceHandler, IContainerInstance } from "@rheas/contracts/container";
export declare class Request extends IncomingMessage implements IRequest, IContainer {
    /**
     * Stores the app instance.
     *
     * @var IApp
     */
    protected _app: IApp | null;
    /**
     * This request's container manager
     *
     * @var IContainer
     */
    protected container: IContainer;
    /**
     * Manages all the request specific services
     *
     * @var IServiceManager
     */
    protected serviceManager: IServiceManager;
    /**
     * The request method.
     *
     * @var string
     */
    protected _method: string | undefined;
    /**
     * Stores the urldecoded query parameters of this request.
     *
     * @var StringObject
     */
    protected _query: AnyObject;
    /**
     * Creates a new server request.
     *
     * @param socket
     */
    constructor(socket: any);
    /**
     * @inheritdoc
     *
     * @param name
     * @param resolver
     */
    singleton(name: string, resolver: InstanceHandler): IContainerInstance;
    /**
     * @inheritdoc
     *
     * @param name
     * @param resolver
     * @param singleton
     */
    bind(name: string, resolver: InstanceHandler, singleton?: boolean): IContainerInstance;
    /**
     * @inheritdoc
     *
     * @param name
     * @param instance
     * @param singleton
     */
    instance<T>(name: string, instance: T, singleton?: boolean): IContainerInstance;
    /**
     * @inheritdoc
     *
     * @param key
     */
    get(key: string): any;
    /**
     * Sets the application instance and boots request services
     * and container.
     *
     * @param app
     */
    boot(app: IApp): IRequest;
    /**
     * Loads the requests query, cookies, headers and post contents.
     */
    private loadRequest;
    /**
     * Loads the request query from the url. The result is urldecoded
     * query stores as key value pairs.
     */
    private loadQuery;
    /**
     *
     */
    private loadBody;
    /**
     * Loads the request services and boots them.
     *
     * @param app
     */
    private loadServices;
    /**
     * Returns the application instance.
     *
     * @returns IApp
     */
    app(): IApp | null;
    /**
     * Gets the request method. This is the method value obtained after
     * checking method overrides in header, post and query. To get the original
     * method call getRealMethod().
     *
     * @returns string
     */
    getMethod(): string;
    /**
     * Returns overridden method if any exists. The function will throw an
     * exception if the app
     *
     * @return string
     */
    protected overriddenMethod(defaultMethod?: string): string;
    /**
     * Returns the actual request method.
     *
     * @returns string
     */
    getRealMethod(): string;
    /**
     * Returns true if the request is a scured one.
     *
     * @returns
     */
    isSecure(): boolean;
    /**
     * Returns http or https schema used by this request.
     *
     * @returns string
     */
    getSchema(): string;
    params(): string[];
    acceptsJson(): boolean;
    getHost(): string;
    getPath(): string;
    getPathComponents(): IRequestComponent[];
    getFullUrl(): string;
    getQueryString(): string;
}
