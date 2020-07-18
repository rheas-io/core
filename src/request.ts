import url from "url";
import mime from "mime-types";
import { Str } from "@rheas/support";
import { IncomingMessage } from "http";
import accepts, { Accepts } from "accepts";
import { Container } from "@rheas/container";
import { config } from "@rheas/support/helpers";
import { ServiceManager } from "./serviceManager";
import { IRedirector } from "@rheas/contracts/core";
import { RequestComponent } from "@rheas/routing/uri";
import { IRequest, AnyObject } from "@rheas/contracts";
import { IServiceManager } from "@rheas/contracts/services";
import { IRequestComponent } from "@rheas/contracts/routes/uri";
import { SuspiciousOperationException } from "@rheas/errors/suspicious";
import { IContainer, InstanceHandler, IContainerInstance } from "@rheas/contracts/container";

export class Request extends IncomingMessage implements IRequest {

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
    protected _negotiator: Accepts | null = null;

    /**
     * The segmented path uri components.
     * 
     * @var array
     */
    protected _pathComponents: IRequestComponent[] | null = null;

    /**
     * Stores request attributes. 
     * 
     * Container bindings are restricted in such a way that singleton keys can't 
     * be replaced. Attributes allow replacing values of a key.
     * 
     * @var AnyObject
     */
    protected _attributes: AnyObject = {};

    /**
     * The format in which response has to be sent.
     * 
     * @var string
     */
    protected _format: string | null = null;

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
    protected _path: string = "";

    /**
     * Caches the query string
     * 
     * @var string
     */
    protected _queryString: string = "";

    /**
     * Stores the urldecoded query parameters of this request.
     * 
     * @var AnyObject
     */
    protected _query: AnyObject = {};

    /**
     * All the request inputs
     * 
     * @var AnyObject
     */
    protected _inputs: AnyObject = {};

    /**
     * Creates a new server request.
     * 
     * @param socket 
     */
    constructor(socket: any) {
        super(socket);

        this._container = new Container();
        this._serviceManager = new ServiceManager(this, config('request.providers', {}));
    }

    /**
     * Boots request services and container. 
     * 
     * The request data like url, query and all the stuff will be available 
     * inside the boot. Process them and store in memory for faster processing
     */
    public boot(): IRequest {
        this.loadRequest();

        this._serviceManager.boot();

        return this;
    }

    /**
     * Loads the requests query, cookies, headers and post contents.
     * 
     * //TODO
     */
    private loadRequest(): void {

        const parsed = url.parse(this.getFullUrl(), true);

        this._query = parsed.query;
        this._queryString = parsed.search || "";
        this._path = Str.path(parsed.pathname || "");

        this._inputs = Object.assign({}, this._query);

        this.loadBody();
    }

    /**
     * 
     */
    private loadBody(): void {

    }

    /**
     * Returns the request redirect handler.
     * 
     * @return IRedirector
     */
    public redirect(): IRedirector {
        return this.get('redirect');
    }

    /**
     * Returns all the inputs as an object.
     * 
     * @returns 
     */
    public all(): AnyObject {
        return this.input();
    }

    /**
     * Returns all the inputs if no key is given or returns the input 
     * value of the key.
     * 
     * @param key 
     */
    public input(key?: string): any {
        if (null == key) {
            return this._inputs;
        }
        const value = this._inputs[key];

        return null == value ? null : value;
    }

    /**
     * Replaces the request inputs with the given argument
     * 
     * @param newParams 
     */
    public merge(newParams: AnyObject): IRequest {

        this._inputs = Object.assign(this._inputs, newParams);

        return this;
    }

    /**
     * Gets the request method. This is the method value obtained after
     * checking method overrides in header, post and query. To get the original
     * method call getRealMethod(). 
     * 
     * @returns string
     */
    public getMethod(): string {
        if (this._method) {
            return this._method;
        }

        let method = this.getRealMethod();

        if (method === 'POST') {
            method = this.overriddenMethod();
        }
        return this._method = method;
    }

    /**
     * Returns overridden method if any exists. The function will throw an
     * exception if the app
     * 
     * @return string
     */
    protected overriddenMethod(defaultMethod: string = "POST"): string {

        let method = <string>this.headers['X-HTTP-METHOD-OVERRIDE'];

        if (!method) {
            //TODO
        }

        if (typeof method !== 'string' || method.length === 0) {
            return defaultMethod;
        }

        method = method.toUpperCase();

        if (!['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].includes(method)) {
            throw new SuspiciousOperationException(`Invalid method requested: ${method}`);
        }

        return method;
    }

    /**
     * Returns path uri components obtained by splitting the uri by 
     * forward slash (/)
     * 
     * @returns array of request uri components
     */
    public getPathComponents(): IRequestComponent[] {

        if (this._pathComponents === null) {
            this._pathComponents = this.getPath().split('/').map(
                component => new RequestComponent(component)
            );
        }

        return this._pathComponents;
    }

    /**
     * Returns the actual request method.
     * 
     * @returns string
     */
    public getRealMethod(): string {
        return (this.method || 'GET').toUpperCase();
    }

    /**
     * Returns true if the request is a scured one.
     * 
     * @returns 
     */
    public isSecure(): boolean {
        return this.getSchema() === "https";
    }

    /**
     * Returns http or https schema used by this request.
     * 
     * @returns string
     */
    public getSchema(): string {
        //@ts-ignore
        let schema = this.socket.encrypted ? "https" : "http";

        return schema;
    }

    /**
     * Returns the request path.
     * 
     * @returns string
     */
    public getPath(): string {
        return this._path;
    }

    /**
     * Returns the request scheme/protocol
     * 
     * @returns string
     */
    public getProtocol(): string {
        return this.isSecure() ? 'https' : 'http';
    }

    /**
     * Get host details from the headers. 
     * 
     * @returns string
     */
    public getHost(): string {
        return this.headers.host || '';
    }

    /**
     * Returns the request full url including protocol, domain,
     * path and query string in the format
     * 
     * https://domain.com/path?query=val
     * 
     * @returns string
     */
    public getFullUrl(): string {
        return this.getProtocol() + '://' + this.getHost() + this.url;
    }

    /**
     * Returns the querystring including the leading ? symbol.
     * 
     * Eg: ?code=abcedfghi&value=63vd7fd8vvv8
     * 
     * @returns string
     */
    public getQueryString(): string {
        return this._queryString;
    }

    //TODO
    public params(): string[] {
        let params: string[] = [];

        this.getPathComponents().forEach(
            components => params.push(...Object.values(components.getParam()))
        );

        return params;
    }

    /**
     * Returns true if the request is an AJAX request.
     * 
     * @returns
     */
    public ajax(): boolean {
        return 'XMLHttpRequest' === this.headers['X-Requested-With'];
    }

    /**
     * Returns true if the request is a PJAX request.
     * 
     * @returns
     */
    public pjax(): boolean {
        return 'true' === this.headers['X-PJAX'];
    }

    /**
     * Returns true if the request accepts the given type.
     * 
     * @param type 
     */
    public accepts(type: string): boolean {
        return false !== this.negotiator().type(type);
    }

    /**
     * Returns true if the request accepts json
     * 
     * @returns 
     */
    public acceptsJson(): boolean {
        return (this.ajax() && !this.pjax() && this.acceptsAnyType()) || this.wantsJson();
    }

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
    public wantsJson(): boolean {
        const types = this.acceptableContentTypes();

        if (types.length > 0) {
            return types[0].includes('/json') || types[0].includes('+json');
        }
        return false;
    }

    /**
     * Returns true if the request accepts any content type
     * 
     * @returns
     */
    public acceptsAnyType(): boolean {
        const types = this.acceptableContentTypes();

        return types.includes('*/*') || types.includes('*');
    }

    /**
     * Returns the acceptable content types in the quality order. 
     * Most preferred are returned first.
     * 
     * @returns 
     */
    public acceptableContentTypes(): string[] {
        return this.negotiator().types() as string[];
    }

    /**
     * Returns true if the request conten-type is a json
     * 
     * @returns
     */
    public isJson(): boolean {
        const content_type = this.headers["content-type"];

        if (content_type) {
            return content_type.includes('/json') || content_type.includes('+json');
        }
        return false;
    }

    /**
     * Returns the negotiator instance.
     * 
     * @returns
     */
    public negotiator(): Accepts {
        if (this._negotiator === null) {
            this._negotiator = accepts(this);
        }
        return this._negotiator;
    }

    /**
     * Returns the mimetype of the format. null if no mime found.
     * 
     * @param format 
     * @return
     */
    public getMimeType(format: string): string | null {
        return mime.lookup(format) || null;
    }

    /**
     * Sets the format in which response has to be send.
     * 
     * @param format 
     */
    public setFormat(format: string): IRequest {
        this._format = format;

        return this;
    }

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
    public getFormat(defaulValue: string = "html"): string {
        if (null == this._format) {
            this._format = this.getAttribute('_format');
        }

        return null == this._format ? defaulValue : this._format;
    }

    /**
     * Sets an attribute value. This enables setting custom values on request
     * that are not actually present in the incoming request. 
     * 
     * @param key 
     * @param value 
     */
    public setAttribute(key: string, value: any): IRequest {

        this._attributes[key] = value;

        return this;
    }

    /**
     * Gets an attribute value if it exists or the defaultValue or null if no 
     * default is given.
     * 
     * @param key 
     * @param defaultValue 
     */
    public getAttribute(key: string, defaultValue: any = null) {

        if (Object.keys(this._attributes).includes(key)) {
            return this._attributes[key];
        }
        return defaultValue;
    }

    /**
     * Binds a singleton resolver to the container. Once resolved, the value 
     * will be used for the lifetime of the service which can either be app
     * lifetime or request lifetime.
     * 
     * @param name 
     * @param resolver 
     */
    public singleton(name: string, resolver: InstanceHandler): IContainerInstance {
        return this._container.singleton(name, resolver);
    }

    /**
     * Binds a resolver to the container. Used mainly for non-singleton resolvers,
     * that gets resolved repeatedly when requested.
     * 
     * @param name 
     * @param resolver 
     * @param singleton 
     */
    public bind(name: string, resolver: InstanceHandler, singleton: boolean = false): IContainerInstance {
        return this._container.bind(name, resolver, singleton);
    }

    /**
     * Adds an instance to this container. Any type of object can be passed as an argument 
     * and returns the same after adding it to container.
     * 
     * @param name 
     * @param instance 
     * @param singleton 
     */
    public instance<T>(name: string, instance: T, singleton: boolean = false): IContainerInstance {
        return this._container.instance(name, instance, singleton);
    }

    /**
     * Returns the binding stored in this container. The resolved value is returned
     * if the key is assigned to a resolver.
     * 
     * @param key 
     */
    public get(key: string) {
        const service = this._container.get(key);

        // If no service is found we will load any deferredServices. If the 
        // deferred service is loaded, we will try getting the value again from the
        // container.
        if (service === null && this._serviceManager.registerServiceByName(key)) {
            return this._container.get(key);
        }
        return service;
    }
}
