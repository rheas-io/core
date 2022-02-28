import url from 'url';
import { Headers } from './headers';
import { IncomingMessage } from 'http';
import { Str } from '@rheas/support/str';
import { Container } from '@rheas/container';
import { Validator } from '@rheas/validation';
import { RequestInput } from './requestInput';
import { RequestParams } from './requestParams';
import { IRoute } from '@rheas/contracts/routes';
import { ServiceManager } from '@rheas/services';
import { RequestContent } from './requestContent';
import { RequestComponent } from '@rheas/routing/uri';
import { IValidator } from '@rheas/contracts/validators';
import { IncomingForm, Fields, Files } from 'formidable';
import { ICookieManager } from '@rheas/contracts/cookies';
import { IServiceManager } from '@rheas/contracts/services';
import { ValidationException } from '@rheas/errors/validation';
import { IRequestComponent } from '@rheas/contracts/routes/uri';
import { IApp, IHeaders, IRedirector } from '@rheas/contracts/core';
import { ISession, ISessionManager } from '@rheas/contracts/sessions';
import { SuspiciousOperationException } from '@rheas/errors/suspicious';
import { BindingNotFoundException } from '@rheas/errors/bindingNotFound';
import { IRequestInput, IRequestParams, IRequestContent } from '@rheas/contracts/core';
import { IRequest, AnyObject, IResponse, StringObject, KeyValue } from '@rheas/contracts';
import { IContainer, InstanceHandler, IContainerInstance } from '@rheas/contracts/container';

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
    protected _path: string = '';

    /**
     * Caches the query string
     *
     * @var string
     */
    protected _queryString: string = '';

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
     * Stores the route params for this request.
     *
     * @var Map
     */
    protected _params: IRequestParams = new RequestParams();

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

        this._container = new Container(this);
        this._headers = new Headers(this.headers);
        this._serviceManager = new ServiceManager(this);
    }

    /**
     * Boots request services and container.
     *
     * The request data like url, query and all the stuff will be available
     * inside the boot. Process them and store in memory for faster processing
     *
     * @param app
     * @param res
     */
    public async boot(app: IApp, res: IResponse): Promise<IRequest> {
        this.instance('app', app, true);
        this.instance('response', res, true);
        this.instance('services', this._serviceManager, true);

        // Inject the service providers from the configurations.
        // app.configs() is used to eliminate the use of helper
        // function configs() in this class. Moreover, it looked ideal
        // to load the services in the boot instead of constructor
        this._serviceManager.setProviders(app.configs().get('request.providers', {}));

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
        this._queryString = parsed.search || '';
        this._path = Str.path(parsed.pathname || '');

        // Load the request body contents like form post data
        // or file uploads.
        const parsedBody = await this.getContents();
        this._body = Object.assign(this._body, parsedBody.fields);
        this._files = Object.assign(this._files, parsedBody.files);

        // Loads the request query.
        this._query = Object.assign(this._query, parsed.query);
    }

    /**
     * Loads the request body using the Formidable package. This will read
     * multipart form data, uriencoded form data and file uploads and returns
     * an object containing fields and files.
     *
     * @returns
     */
    public async getContents(): Promise<{ files: Files; fields: Fields }> {
        const form = new IncomingForm({ multiples: true });

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
     * Sets the matching route of this request. The params should be loaded
     * only when a matching route is found.
     *
     * @param route
     */
    public setRoute(route: IRoute): IRequest {
        this._params.setParameters(this.getPathComponents());

        return this;
    }

    /**
     * Validates a request for the given rules. If it does not pass, throws a
     * validation exception.
     *
     * @param rules
     * @param messages
     * @param aliases
     */
    public validate(
        rules: StringObject,
        messages: KeyValue<StringObject> = {},
        aliases: StringObject = {},
    ) {
        const validator: IValidator = new Validator(this.inputs().all(), rules, messages, aliases);

        if (validator.fails()) {
            throw new ValidationException(validator);
        }
    }

    /**
     * Returns the request redirect handler. Throws an exception
     * if the service is not registered.
     *
     * @return IRedirector
     */
    public redirect(): IRedirector {
        return this.get('redirect');
    }

    /**
     * Returns the cookies manager service. Throws an exception if
     * the cookies service is not registered.
     *
     * @returns
     */
    public cookies(): ICookieManager {
        return this.get('cookie');
    }

    /**
     * Returns the session manager service. Throws an exception if
     * the sessions service is not registered.
     *
     * @returns
     */
    public sessions(): ISessionManager {
        return this.get('session');
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
     * Returns the bearer token from the request
     *
     * @returns
     */
    public bearerToken(): string {
        const header = this.reqHeaders().get('Authorization', '');

        return Str.trimStart(header, 'Bearer ');
    }

    /**
     * Returns true if the request method is one of HEAD, GET
     * and OPTIONS.
     *
     * @returns
     */
    public isReadRequest(): boolean {
        return ['HEAD', 'GET', 'OPTIONS'].includes(this.getMethod());
    }

    /**
     * Returns true if the request uri is exempted in the app exemption list
     * for the given exemptKey.
     *
     * @param exemptKey
     */
    public isExemptedIn(exemptKey: string): boolean {
        const app: IApp = this.get('app');

        const exceptions = app.exceptions(exemptKey);

        for (let exception of exceptions) {
            // Check for full url match
            if (Str.matches(this.getFullUrl(), exception)) {
                return true;
            }
            // Check for path match if full url match failed
            if (Str.matches(this.getPath(), exception)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Checks if this request is CSRF protected or not.
     *
     * @returns
     */
    public isCsrfProtected(): ISession | false {
        const sessionManager = this.sessions();
        const session = sessionManager.getSession();

        if (!session) {
            return false;
        }
        // Read different headers and determine if token matches. _csrf field in the
        // GET or POST takes higher precedence, followed by X-CSRF-TOKEN header and
        // finally X-XSRF-TOKEN header.
        let token = this.inputs().get('_csrf');

        if (token == null || token === '') {
            token = this.stringFromHeader('X-CSRF-TOKEN') || this.stringFromHeader('X-XSRF-TOKEN');
        }

        return session.getCsrf() === token ? session : false;
    }

    /**
     * Returns a single string value from the given header
     *
     * @param header
     */
    public stringFromHeader(header: string): string {
        let value = this.headers[header];

        if (value && typeof value !== 'string') {
            value = value[0];
        }
        return value || '';
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
        return (this._method = method);
    }

    /**
     * Returns overridden method if any exists. The function will throw an
     * exception if the app
     *
     * @return string
     */
    protected overriddenMethod(defaultMethod: string = 'POST'): string {
        let method = <string>this.headers['X-HTTP-METHOD-OVERRIDE'];

        if (!method) {
            method = this.inputs().get('_method', 'POST');
        }

        if (typeof method !== 'string' || method.length === 0) {
            return defaultMethod;
        }

        method = method.toUpperCase();

        if (
            ![
                'GET',
                'HEAD',
                'POST',
                'PUT',
                'PATCH',
                'DELETE',
                'OPTIONS',
                'TRACE',
                'CONNECT',
            ].includes(method)
        ) {
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
            this._pathComponents = this.getPath()
                .split('/')
                .map((component) => new RequestComponent(component));
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
        return this.getSchema() === 'https';
    }

    /**
     * Returns http or https schema used by this request.
     *
     * @returns string
     */
    public getSchema(): string {
        //@ts-ignore
        return this.socket.encrypted ? 'https' : 'http';
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
     * Returns the urldecoded query parameters of this request as an
     * object.
     *
     * @returns
     */
    public query(): AnyObject {
        return this._query;
    }

    /**
     * Returns the parameter value map.
     *
     * @returns
     */
    public params(): IRequestParams {
        return this._params;
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
    public tie(name: string, resolver: InstanceHandler, singleton: boolean = false) {
        return this._container.tie(name, resolver, singleton);
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
     * Returns the binding stored in this container/request lifecyle. The resolved
     * value is returned if the key is assigned to a resolver. If the binding is not
     * found in this container, we will check the same on the app container.
     *
     * If the binding is not found in app level container, then a BindingNotFound
     * exception is thrown.
     *
     * @param key
     */
    public get(key: string) {
        this._serviceManager.registerServiceByName(key);

        try {
            return this._container.get(key);
        } catch (error) {
            // Only BindingNotFoundException should proceed to check
            // the app level bindings.
            if (!(error instanceof BindingNotFoundException)) {
                throw error;
            }
            // Check the presence of the binding on the app container/lifecycle
            // This will allow us to bypass the get('app') on request cycle whenever
            // we want something from the app lifecycle.
            const app: IApp = this._container.get('app');

            return app.get(key);
        }
    }
}
