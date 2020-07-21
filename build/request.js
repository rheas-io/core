"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = __importDefault(require("url"));
const headers_1 = require("./headers");
const support_1 = require("@rheas/support");
const http_1 = require("http");
const container_1 = require("@rheas/container");
const requestInput_1 = require("./requestInput");
const helpers_1 = require("@rheas/support/helpers");
const requestContent_1 = require("./requestContent");
const serviceManager_1 = require("./serviceManager");
const uri_1 = require("@rheas/routing/uri");
const formidable_1 = require("formidable");
const suspicious_1 = require("@rheas/errors/suspicious");
class Request extends http_1.IncomingMessage {
    /**
     * Creates a new server request.
     *
     * @param socket
     */
    constructor(socket) {
        super(socket);
        /**
         * Manages all the request contents
         *
         * @var IRequestContent
         */
        this._contentsManager = null;
        /**
         * Manages all the request inputs
         *
         * @var IRequestInput
         */
        this._inputsManager = null;
        /**
         * The segmented path uri components.
         *
         * @var array
         */
        this._pathComponents = null;
        /**
         * Caches the url path
         *
         * @var string
         */
        this._path = "";
        /**
         * Caches the query string
         *
         * @var string
         */
        this._queryString = "";
        /**
         * Stores the POST request body contents.
         *
         * @var AnyObject
         */
        this._body = {};
        /**
         * Stores the files uploaded with field names as key.
         *
         * @var AnyObject
         */
        this._files = {};
        /**
         * Stores the urldecoded query parameters of this request.
         *
         * @var AnyObject
         */
        this._query = {};
        this._container = new container_1.Container();
        this._headers = new headers_1.Headers(this.headers);
        this._serviceManager = new serviceManager_1.ServiceManager(this, helpers_1.config('request.providers', {}));
    }
    /**
     * Boots request services and container.
     *
     * The request data like url, query and all the stuff will be available
     * inside the boot. Process them and store in memory for faster processing
     */
    async boot() {
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
    async loadRequest() {
        const parsed = url_1.default.parse(this.getFullUrl(), true);
        this._query = parsed.query;
        this._queryString = parsed.search || "";
        this._path = support_1.Str.path(parsed.pathname || "");
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
    async getContents() {
        const form = new formidable_1.IncomingForm();
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
    redirect() {
        return this.get('redirect');
    }
    /**
     * Returns the header manager of this request.
     *
     * @returns
     */
    reqHeaders() {
        return this._headers;
    }
    /**
     * Returns the requets content manager which is responsible for
     * reading content-type related headers and performing various checks
     * and operations.
     *
     * @returns
     */
    contents() {
        if (this._contentsManager === null) {
            this._contentsManager = new requestContent_1.RequestContent(this);
        }
        return this._contentsManager;
    }
    /**
     * Returns the request inputs manager.
     *
     * @returns
     */
    inputs() {
        if (this._inputsManager === null) {
            this._inputsManager = new requestInput_1.RequestInput(this);
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
    getMethod() {
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
    overriddenMethod(defaultMethod = "POST") {
        let method = this.headers['X-HTTP-METHOD-OVERRIDE'];
        if (!method) {
            //TODO
        }
        if (typeof method !== 'string' || method.length === 0) {
            return defaultMethod;
        }
        method = method.toUpperCase();
        if (!['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].includes(method)) {
            throw new suspicious_1.SuspiciousOperationException(`Invalid method requested: ${method}`);
        }
        return method;
    }
    /**
     * Returns path uri components obtained by splitting the uri by
     * forward slash (/)
     *
     * @returns array of request uri components
     */
    getPathComponents() {
        if (this._pathComponents === null) {
            this._pathComponents = this.getPath().split('/').map(component => new uri_1.RequestComponent(component));
        }
        return this._pathComponents;
    }
    /**
     * Returns the actual request method.
     *
     * @returns string
     */
    getRealMethod() {
        return (this.method || 'GET').toUpperCase();
    }
    /**
     * Returns true if the request is a scured one.
     *
     * @returns
     */
    isSecure() {
        return this.getSchema() === "https";
    }
    /**
     * Returns http or https schema used by this request.
     *
     * @returns string
     */
    getSchema() {
        //@ts-ignore
        return (this.socket.encrypted ? "https" : "http");
    }
    /**
     * Returns the request path.
     *
     * @returns string
     */
    getPath() {
        return this._path;
    }
    /**
     * Returns the request scheme/protocol
     *
     * @returns string
     */
    getProtocol() {
        return this.isSecure() ? 'https' : 'http';
    }
    /**
     * Get host details from the headers.
     *
     * @returns string
     */
    getHost() {
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
    getFullUrl() {
        return this.getProtocol() + '://' + this.getHost() + this.url;
    }
    /**
     * Returns the querystring including the leading ? symbol.
     *
     * Eg: ?code=abcedfghi&value=63vd7fd8vvv8
     *
     * @returns string
     */
    getQueryString() {
        return this._queryString;
    }
    /**
     * Returns the request body contents as JSON object.
     *
     * @returns
     */
    body() {
        return this._body;
    }
    /**
     * Returns the uploaded request files.
     *
     * @returns
     */
    files() {
        return this._files;
    }
    /**
     *
     * @returns
     */
    query() {
        return this._query;
    }
    /**
     *
     * //TODO
     */
    params() {
        let params = [];
        this.getPathComponents().forEach(components => params.push(...Object.values(components.getParam())));
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
    singleton(name, resolver) {
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
    bind(name, resolver, singleton = false) {
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
    instance(name, instance, singleton = false) {
        return this._container.instance(name, instance, singleton);
    }
    /**
     * Returns the binding stored in this container. The resolved value is returned
     * if the key is assigned to a resolver.
     *
     * @param key
     * @param defaultValue
     */
    get(key, defaultValue = null) {
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
exports.Request = Request;
