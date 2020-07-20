/// <reference types="node" />
import { IncomingMessage } from "http";
import { IRequest, AnyObject } from "@rheas/contracts";
import { IServiceManager } from "@rheas/contracts/services";
import { IRequestComponent } from "@rheas/contracts/routes/uri";
import { IRedirector, IRequestContent, IRequestInput } from "@rheas/contracts/core";
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
     * Manages all the request contents
     *
     * @var IRequestContent
     */
    protected _contentsManager: IRequestContent | null;
    /**
     * Manages all the request inputs
     *
     * @var IRequestInput
     */
    protected _inputsManager: IRequestInput | null;
    /**
     * The segmented path uri components.
     *
     * @var array
     */
    protected _pathComponents: IRequestComponent[] | null;
    /**
     * The request method.
     *
     * @var string
     */
    protected _method: string | undefined;
    /**
     * Caches the url path
     *
     * @var string
     */
    protected _path: string;
    /**
     * Caches the query string
     *
     * @var string
     */
    protected _queryString: string;
    /**
     * Stores the urldecoded query parameters of this request.
     *
     * @var AnyObject
     */
    protected _query: AnyObject;
    /**
     * Creates a new server request.
     *
     * @param socket
     */
    constructor(socket: any);
    /**
     * Boots request services and container.
     *
     * The request data like url, query and all the stuff will be available
     * inside the boot. Process them and store in memory for faster processing
     */
    boot(): IRequest;
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
     * Returns the request redirect handler.
     *
     * @return IRedirector
     */
    redirect(): IRedirector;
    /**
     * Returns the requets content manager which is responsible for
     * reading content-type related headers and performing various checks
     * and operations.
     *
     * @returns
     */
    contents(): IRequestContent;
    /**
     * Returns the request inputs manager.
     *
     * @returns
     */
    inputs(): IRequestInput;
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
     * Returns the request path.
     *
     * @returns string
     */
    getPath(): string;
    /**
     * Returns the request scheme/protocol
     *
     * @returns string
     */
    getProtocol(): string;
    /**
     * Get host details from the headers.
     *
     * @returns string
     */
    getHost(): string;
    /**
     * Returns the request full url including protocol, domain,
     * path and query string in the format
     *
     * https://domain.com/path?query=val
     *
     * @returns string
     */
    getFullUrl(): string;
    /**
     * Returns the querystring including the leading ? symbol.
     *
     * Eg: ?code=abcedfghi&value=63vd7fd8vvv8
     *
     * @returns string
     */
    getQueryString(): string;
    /**
     *
     * //TODO
     */
    params(): string[];
    /**
     * Binds a singleton resolver to the container. Once resolved, the value
     * will be used for the lifetime of the service which can either be app
     * lifetime or request lifetime.
     *
     * @param name
     * @param resolver
     */
    singleton(name: string, resolver: InstanceHandler): IContainerInstance;
    /**
     * Binds a resolver to the container. Used mainly for non-singleton resolvers,
     * that gets resolved repeatedly when requested.
     *
     * @param name
     * @param resolver
     * @param singleton
     */
    bind(name: string, resolver: InstanceHandler, singleton?: boolean): IContainerInstance;
    /**
     * Adds an instance to this container. Any type of object can be passed as an argument
     * and returns the same after adding it to container.
     *
     * @param name
     * @param instance
     * @param singleton
     */
    instance<T>(name: string, instance: T, singleton?: boolean): IContainerInstance;
    /**
     * Returns the binding stored in this container. The resolved value is returned
     * if the key is assigned to a resolver.
     *
     * @param key
     * @param defaultValue
     */
    get(key: string, defaultValue?: any): any;
}
