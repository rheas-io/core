/// <reference types="node" />
import { IncomingMessage } from "http";
import { Accepts } from "accepts";
import { IRedirector } from "@rheas/contracts/core";
import { IRequest, AnyObject } from "@rheas/contracts";
import { IServiceManager } from "@rheas/contracts/services";
import { IRequestComponent } from "@rheas/contracts/routes/uri";
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
     * The accept instance that has to be used for negotiations.
     *
     * @var Accepts
     */
    protected _negotiator: Accepts | null;
    /**
     * The segmented path uri components.
     *
     * @var array
     */
    protected _pathComponents: IRequestComponent[] | null;
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
     * All the request inputs
     *
     * @var AnyObject
     */
    protected _inputs: AnyObject;
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
     * Returns all the inputs as an object.
     *
     * @returns
     */
    all(): AnyObject;
    /**
     * Returns all the inputs if no key is given or returns the input
     * value of the key.
     *
     * @param key
     */
    input(key?: string): any;
    /**
     * Replaces the request inputs with the given argument
     *
     * @param newParams
     */
    merge(newParams: AnyObject): IRequest;
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
    params(): string[];
    /**
     * Returns true if the request is an AJAX request.
     *
     * @returns
     */
    ajax(): boolean;
    /**
     * Returns true if the request is a PJAX request.
     *
     * @returns
     */
    pjax(): boolean;
    /**
     * Returns true if the request accepts the given type.
     *
     * @param type
     */
    accepts(type: string): boolean;
    /**
     * Returns true if the request accepts json
     *
     * @returns
     */
    acceptsJson(): boolean;
    /**
     * Returns true if the request is specifically asking for json. Mimetype for
     * json content is either
     *
     * [1] application/json
     * [2] application/problem+json
     *
     * We will check for the presence of "/json" and "+json" strings. We use the string
     * check as the negotiator might return true even if the client is not requesting
     * for it but accepts any type "*"
     *
     * @returns
     */
    wantsJson(): boolean;
    /**
     * Returns true if the request accepts any content type
     *
     * @returns
     */
    acceptsAnyType(): boolean;
    /**
     * Returns the acceptable content types in the quality order.
     * Most preferred are returned first.
     *
     * @returns
     */
    acceptableContentTypes(): string[];
    /**
     * Returns true if the request conten-type is a json
     *
     * @returns
     */
    isJson(): boolean;
    /**
     * Returns the negotiator instance.
     *
     * @returns
     */
    negotiator(): Accepts;
    /**
     * Returns the mimetype of the format. null if no mime found.
     *
     * @param format
     * @return
     */
    getMimeType(format: string): string | null;
    /**
     * Sets the format in which response has to be send.
     *
     * @param format
     */
    setFormat(format: string): IRequest;
    /**
     * Gets the request format set by the application. Setting a custom format
     * to the request overrides the accept header.
     *
     * For instance, if accept header allows both html and json and the server
     * want to send json, application can set "json" as the request format and
     * the response will have json content-type.
     *
     * @returns string
     */
    getFormat(defaulValue?: string): string;
    /**
     * Sets an attribute value. This enables setting custom values on request
     * that are not actually present in the incoming request.
     *
     * @param key
     * @param value
     */
    setAttribute(key: string, value: any): IRequest;
    /**
     * Gets an attribute value if it exists or the defaultValue or null if no
     * default is given.
     *
     * @param key
     * @param defaultValue
     */
    getAttribute(key: string, defaultValue?: any): any;
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
     */
    get(key: string): any;
}
