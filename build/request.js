"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var url_1 = __importDefault(require("url"));
var support_1 = require("@rheas/support");
var http_1 = require("http");
var container_1 = require("@rheas/container");
var requestInput_1 = require("./requestInput");
var helpers_1 = require("@rheas/support/helpers");
var requestContent_1 = require("./requestContent");
var serviceManager_1 = require("./serviceManager");
var uri_1 = require("@rheas/routing/uri");
var suspicious_1 = require("@rheas/errors/suspicious");
var Request = /** @class */ (function (_super) {
    __extends(Request, _super);
    /**
     * Creates a new server request.
     *
     * @param socket
     */
    function Request(socket) {
        var _this = _super.call(this, socket) || this;
        /**
         * Manages all the request contents
         *
         * @var IRequestContent
         */
        _this._contentsManager = null;
        /**
         * Manages all the request inputs
         *
         * @var IRequestInput
         */
        _this._inputsManager = null;
        /**
         * The segmented path uri components.
         *
         * @var array
         */
        _this._pathComponents = null;
        /**
         * Caches the url path
         *
         * @var string
         */
        _this._path = "";
        /**
         * Caches the query string
         *
         * @var string
         */
        _this._queryString = "";
        /**
         * Stores the urldecoded query parameters of this request.
         *
         * @var AnyObject
         */
        _this._query = {};
        _this._container = new container_1.Container();
        _this._serviceManager = new serviceManager_1.ServiceManager(_this, helpers_1.config('request.providers', {}));
        return _this;
    }
    /**
     * Boots request services and container.
     *
     * The request data like url, query and all the stuff will be available
     * inside the boot. Process them and store in memory for faster processing
     */
    Request.prototype.boot = function () {
        this.loadRequest();
        this._serviceManager.boot();
        return this;
    };
    /**
     * Loads the requests query, cookies, headers and post contents.
     *
     * //TODO
     */
    Request.prototype.loadRequest = function () {
        var parsed = url_1.default.parse(this.getFullUrl(), true);
        this._query = parsed.query;
        this._queryString = parsed.search || "";
        this._path = support_1.Str.path(parsed.pathname || "");
        this.loadBody();
    };
    /**
     *
     */
    Request.prototype.loadBody = function () {
    };
    /**
     * Returns the request redirect handler.
     *
     * @return IRedirector
     */
    Request.prototype.redirect = function () {
        return this.get('redirect');
    };
    /**
     * Returns the requets content manager which is responsible for
     * reading content-type related headers and performing various checks
     * and operations.
     *
     * @returns
     */
    Request.prototype.contents = function () {
        if (this._contentsManager === null) {
            this._contentsManager = new requestContent_1.RequestContent(this);
        }
        return this._contentsManager;
    };
    /**
     * Returns the request inputs manager.
     *
     * @returns
     */
    Request.prototype.inputs = function () {
        if (this._inputsManager === null) {
            this._inputsManager = new requestInput_1.RequestInput(this);
        }
        return this._inputsManager;
    };
    /**
     * Gets the request method. This is the method value obtained after
     * checking method overrides in header, post and query. To get the original
     * method call getRealMethod().
     *
     * @returns string
     */
    Request.prototype.getMethod = function () {
        if (this._method) {
            return this._method;
        }
        var method = this.getRealMethod();
        if (method === 'POST') {
            method = this.overriddenMethod();
        }
        return this._method = method;
    };
    /**
     * Returns overridden method if any exists. The function will throw an
     * exception if the app
     *
     * @return string
     */
    Request.prototype.overriddenMethod = function (defaultMethod) {
        if (defaultMethod === void 0) { defaultMethod = "POST"; }
        var method = this.headers['X-HTTP-METHOD-OVERRIDE'];
        if (!method) {
            //TODO
        }
        if (typeof method !== 'string' || method.length === 0) {
            return defaultMethod;
        }
        method = method.toUpperCase();
        if (!['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].includes(method)) {
            throw new suspicious_1.SuspiciousOperationException("Invalid method requested: " + method);
        }
        return method;
    };
    /**
     * Returns path uri components obtained by splitting the uri by
     * forward slash (/)
     *
     * @returns array of request uri components
     */
    Request.prototype.getPathComponents = function () {
        if (this._pathComponents === null) {
            this._pathComponents = this.getPath().split('/').map(function (component) { return new uri_1.RequestComponent(component); });
        }
        return this._pathComponents;
    };
    /**
     * Returns the actual request method.
     *
     * @returns string
     */
    Request.prototype.getRealMethod = function () {
        return (this.method || 'GET').toUpperCase();
    };
    /**
     * Returns true if the request is a scured one.
     *
     * @returns
     */
    Request.prototype.isSecure = function () {
        return this.getSchema() === "https";
    };
    /**
     * Returns http or https schema used by this request.
     *
     * @returns string
     */
    Request.prototype.getSchema = function () {
        //@ts-ignore
        return (this.socket.encrypted ? "https" : "http");
    };
    /**
     * Returns the request path.
     *
     * @returns string
     */
    Request.prototype.getPath = function () {
        return this._path;
    };
    /**
     * Returns the request scheme/protocol
     *
     * @returns string
     */
    Request.prototype.getProtocol = function () {
        return this.isSecure() ? 'https' : 'http';
    };
    /**
     * Get host details from the headers.
     *
     * @returns string
     */
    Request.prototype.getHost = function () {
        return this.headers.host || '';
    };
    /**
     * Returns the request full url including protocol, domain,
     * path and query string in the format
     *
     * https://domain.com/path?query=val
     *
     * @returns string
     */
    Request.prototype.getFullUrl = function () {
        return this.getProtocol() + '://' + this.getHost() + this.url;
    };
    /**
     * Returns the querystring including the leading ? symbol.
     *
     * Eg: ?code=abcedfghi&value=63vd7fd8vvv8
     *
     * @returns string
     */
    Request.prototype.getQueryString = function () {
        return this._queryString;
    };
    /**
     *
     * //TODO
     */
    Request.prototype.params = function () {
        var params = [];
        this.getPathComponents().forEach(function (components) { return params.push.apply(params, Object.values(components.getParam())); });
        return params;
    };
    /**
     * Binds a singleton resolver to the container. Once resolved, the value
     * will be used for the lifetime of the service which can either be app
     * lifetime or request lifetime.
     *
     * @param name
     * @param resolver
     */
    Request.prototype.singleton = function (name, resolver) {
        return this._container.singleton(name, resolver);
    };
    /**
     * Binds a resolver to the container. Used mainly for non-singleton resolvers,
     * that gets resolved repeatedly when requested.
     *
     * @param name
     * @param resolver
     * @param singleton
     */
    Request.prototype.bind = function (name, resolver, singleton) {
        if (singleton === void 0) { singleton = false; }
        return this._container.bind(name, resolver, singleton);
    };
    /**
     * Adds an instance to this container. Any type of object can be passed as an argument
     * and returns the same after adding it to container.
     *
     * @param name
     * @param instance
     * @param singleton
     */
    Request.prototype.instance = function (name, instance, singleton) {
        if (singleton === void 0) { singleton = false; }
        return this._container.instance(name, instance, singleton);
    };
    /**
     * Returns the binding stored in this container. The resolved value is returned
     * if the key is assigned to a resolver.
     *
     * @param key
     * @param defaultValue
     */
    Request.prototype.get = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        var service = this._container.get(key, defaultValue);
        // If no service is found we will load any deferredServices. If the 
        // deferred service is loaded, we will try getting the value again from the
        // container.
        if (service === null && this._serviceManager.registerServiceByName(key)) {
            return this._container.get(key, defaultValue);
        }
        return service;
    };
    return Request;
}(http_1.IncomingMessage));
exports.Request = Request;
