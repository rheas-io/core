import url from "url";
import { Headers } from "./headers";
import { Str } from "@rheas/support";
import { IncomingMessage } from "http";
import { Container } from "@rheas/container";
import { RequestInput } from "./requestInput";
import { config } from "@rheas/support/helpers";
import { RequestContent } from "./requestContent";
import { ServiceManager } from "./serviceManager";
import { RequestComponent } from "@rheas/routing/uri";
import { IRequest, AnyObject } from "@rheas/contracts";
import { IncomingForm, Fields, Files } from "formidable";
import { IServiceManager } from "@rheas/contracts/services";
import { IRequestComponent } from "@rheas/contracts/routes/uri";
import { SuspiciousOperationException } from "@rheas/errors/suspicious";
import { IRedirector, IRequestContent, IRequestInput, IHeaders } from "@rheas/contracts/core";
import { IContainer, InstanceHandler, IContainerInstance } from "@rheas/contracts/container";

interface IParsedBody {
    files: Files,
    fields: Fields,
}

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
     * Manages all the request contents
     * 
     * @var IRequestContent
     */
    protected _contentsManager: IRequestContent | null = null;

    /**
     * Manages all the request inputs
     * 
     * @var IRequestInput
     */
    protected _inputsManager: IRequestInput | null = null;

    /**
     * The segmented path uri components.
     * 
     * @var array
     */
    protected _pathComponents: IRequestComponent[] | null = null;

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
     * Stores the POST request body contents.
     * 
     * @var AnyObject
     */
    protected _body: AnyObject = {};

    /**
     * Stores the files uploaded with field names as key.
     * 
     * @var AnyObject
     */
    protected _files: AnyObject = {};

    /**
     * Stores the urldecoded query parameters of this request.
     * 
     * @var AnyObject
     */
    protected _query: AnyObject = {};

    /**
     * The request header object. Responsible for querying request 
     * headers, parses cookies etc.
     * 
     * @var IHeaders
     */
    protected _headers: IHeaders;

    /**
     * Creates a new server request.
     * 
     * @param socket 
     */
    constructor(socket: any) {
        super(socket);

        this._container = new Container();
        this._headers = new Headers(this.headers);
        this._serviceManager = new ServiceManager(this, config('request.providers', {}));
    }

    /**
     * Boots request services and container. 
     * 
     * The request data like url, query and all the stuff will be available 
     * inside the boot. Process them and store in memory for faster processing
     */
    public async boot(): Promise<IRequest> {
        await this.loadRequest();

        this._serviceManager.boot();

        return this;
    }

    /**
     * This function is responsible for parsing the request and obtaining
     * necessary fields like query, path, body, files etc.
     * 
     * [1] The query object, req path and query string are parsed by the NodeJS
     *     url.parse module.
     * 
     * [2] Request body and file uploads are handled by the Formidable package. 
     */
    protected async loadRequest(): Promise<void> {

        const parsed = url.parse(this.getFullUrl(), true);

        this._query = parsed.query;
        this._queryString = parsed.search || "";
        this._path = Str.path(parsed.pathname || "");

        // Load the request body contents like form post data
        // or file uploads.
        const parsedBody = await this.getContents();

        this._body = parsedBody.fields;
        this._files = parsedBody.files;
    }

    /**
     * Loads the request body using the Formidable package. This will read
     * multipart form data, uriencoded form data and file uploads and returns
     * an object containing fields and files.
     * 
     * @returns 
     */
    public async getContents(): Promise<IParsedBody> {
        const form = new IncomingForm();
        form.multiples = true;

        return await new Promise((resolve, reject) => {
            form.parse(this, (err, fields, files) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ fields, files });
            });
        });
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
     * Returns the header manager of this request.
     * 
     * @returns
     */
    public reqHeaders(): IHeaders {
        return this._headers;
    }

    /**
     * Returns the requets content manager which is responsible for
     * reading content-type related headers and performing various checks
     * and operations.
     * 
     * @returns
     */
    public contents(): IRequestContent {
        if (this._contentsManager === null) {
            this._contentsManager = new RequestContent(this);
        }
        return this._contentsManager;
    }

    /**
     * Returns the request inputs manager.
     * 
     * @returns
     */
    public inputs(): IRequestInput {
        if (this._inputsManager === null) {
            this._inputsManager = new RequestInput(this);
        }
        return this._inputsManager;
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
        return (this.socket.encrypted ? "https" : "http");
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

    /**
     * Returns the request body contents as JSON object.
     * 
     * @returns
     */
    public body(): AnyObject {
        return this._body;
    }

    /**
     * Returns the uploaded request files.
     * 
     * @returns
     */
    public files(): AnyObject {
        return this._files;
    }

    /**
     * 
     * @returns
     */
    public query(): AnyObject {
        return this._query;
    }

    /**
     * 
     * //TODO
     */
    public params(): string[] {
        let params: string[] = [];

        this.getPathComponents().forEach(
            components => params.push(...Object.values(components.getParam()))
        );

        return params;
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
     * @param defaultValue
     */
    public get(key: string, defaultValue: any = null) {
        const service = this._container.get(key, defaultValue);

        // If no service is found we will load any deferredServices. If the 
        // deferred service is loaded, we will try getting the value again from the
        // container.
        if (service === null && this._serviceManager.registerServiceByName(key)) {
            return this._container.get(key, defaultValue);
        }
        return service;
    }
}
