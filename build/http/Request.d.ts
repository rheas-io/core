/// <reference types="node" />
import { IncomingMessage } from "http";
import { IApp, IRedirector } from "@rheas/contracts/core";
import { IServiceManager } from "@rheas/contracts/services";
import { IRequestComponent } from "@rheas/contracts/routes/uri";
import { IRequest, IResponse, AnyObject } from "@rheas/contracts";
import { IContainer, InstanceHandler, IContainerInstance } from "@rheas/contracts/container";
export declare class Request extends IncomingMessage implements IRequest {
    /**
     * This request's container manager
     *
     * @var IContainer
     */
    protected _container: IContainer;
    /**
     * Manages all the request specific services
     *
     * @var IServiceManager
     */
    protected _serviceManager: IServiceManager;
    /**
     * The segmented path uri components.
     *
     * @var array
     */
    protected _pathComponents: IRequestComponent[];
    /**
     * Stores request attributes.
     *
     * Container bindings are restricted in such a way that singleton keys can't
     * be replaced. Attributes allow replacing values of a key.
     *
     * @var AnyObject
     */
    protected _attributes: AnyObject;
    /**
     * The format in which response has to be sent.
     *
     * @var string
     */
    protected _format: string | null;
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
     * Sets the application instance and boots request services and
     * container.
     *
     * The request data like url, query and all the stuff will be available
     * inside the boot. Process them and store in memory for faster processing
     *
     * @param app
     * @param response
     */
    boot(app: IApp, response: IResponse): IRequest;
    /**
     * Loads the requests query, cookies, headers and post contents.
     *
     * //TODO
     */
    private loadRequest;
    /**
     *
     */
    private loadBody;
    /**
     * @inheritdoc
     *
     * @return IRedirector
     */
    redirect(): IRedirector;
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
     * Returns path uri components obtained by splitting the uri by
     * forward slash (/)
     *
     * @returns array of request uri components
     */
    getPathComponents(): IRequestComponent[];
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
    /**
     *
     *
     * @returns string
     */
    getPath(): string;
    getProtocol(): string;
    getHost(): string;
    getFullUrl(): string;
    getQueryString(): string;
    params(): string[];
    isJson(): boolean;
    acceptsJson(): boolean;
    /**
     * Sets the format in which response has to be send.
     *
     * @param format
     */
    setFormat(format: string): IRequest;
    /**
     * @inheritdoc
     *
     * @returns string
     */
    getFormat(defaulValue?: string): string;
    /**
     * @inheritdoc
     *
     * @param format
     * @return
     */
    getMimeType(format: string): string | null;
    /**
     * @inheritdoc
     *
     * @param key
     * @param value
     */
    setAttribute(key: string, value: any): IRequest;
    /**
     * @inheritdoc
     *
     * @param key
     * @param defaultValue
     */
    getAttribute(key: string, defaultValue?: any): any;
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
}
