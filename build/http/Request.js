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
var send_1 = require("send");
var http_1 = require("http");
var container_1 = require("../container");
var serviceManager_1 = require("../serviceManager");
var errors_1 = require("../errors");
var uriComponentFactory_1 = require("@rheas/routing/uri/uriComponentFactory");
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
         * The segmented path uri components.
         *
         * @var array
         */
        _this._pathComponents = [];
        /**
         * Stores request attributes.
         *
         * Container bindings are restricted in such a way that singleton keys can't
         * be replaced. Attributes allow replacing values of a key.
         *
         * @var AnyObject
         */
        _this._attributes = {};
        /**
         * The format in which response has to be sent.
         *
         * @var string
         */
        _this._format = null;
        /**
         * Stores the urldecoded query parameters of this request.
         *
         * @var StringObject
         */
        _this._query = {};
        _this.container = new container_1.Container();
        _this.serviceManager = new serviceManager_1.ServiceManager(_this);
        _this.loadRequest();
        return _this;
    }
    /**
     * Loads the requests query, cookies, headers and post contents.
     */
    Request.prototype.loadRequest = function () {
        this._pathComponents = uriComponentFactory_1.ComponentFactory.createFromRequest(this);
        this.loadQuery();
        this.loadBody();
    };
    /**
     * Loads the request query from the url. The result is urldecoded
     * query stores as key value pairs.
     */
    Request.prototype.loadQuery = function () {
        this._query = url_1.default.parse(this.url || "", true).query;
    };
    /**
     *
     */
    Request.prototype.loadBody = function () {
    };
    /**
     * Sets the application instance and boots request services
     * and container.
     *
     * @param app
     */
    Request.prototype.boot = function (app) {
        this.instance('app', app, true);
        this.loadServices(app);
        return this;
    };
    /**
     * Loads the request services and boots them.
     *
     * @param app
     */
    Request.prototype.loadServices = function (app) {
        this.serviceManager.setProviders(app.config('request.providers') || {});
        this.serviceManager.boot();
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
            throw new errors_1.SuspiciousOperationException("Invalid method requested: " + method);
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
        var schema = this.socket.encrypted ? "https" : "http";
        return schema;
    };
    Request.prototype.params = function () {
        throw new Error("Method not implemented.");
    };
    Request.prototype.isJson = function () {
        throw new Error("Method not implemented.");
    };
    Request.prototype.acceptsJson = function () {
        throw new Error("Method not implemented.");
    };
    Request.prototype.getHost = function () {
        throw new Error("Method not implemented.");
    };
    Request.prototype.getPath = function () {
        throw new Error("Method not implemented.");
    };
    Request.prototype.getFullUrl = function () {
        throw new Error("Method not implemented.");
    };
    Request.prototype.getQueryString = function () {
        throw new Error("Method not implemented.");
    };
    /**
     * Sets the format in which response has to be send.
     *
     * @param format
     */
    Request.prototype.setFormat = function (format) {
        this._format = format;
        return this;
    };
    /**
     * @inheritdoc
     *
     * @returns string
     */
    Request.prototype.getFormat = function (defaulValue) {
        if (defaulValue === void 0) { defaulValue = "html"; }
        if (null == this._format) {
            this._format = this.getAttribute('_format');
        }
        return null == this._format ? defaulValue : this._format;
    };
    /**
     * @inheritdoc
     *
     * @param format
     * @return
     */
    Request.prototype.getMimeType = function (format) {
        return send_1.mime.getType(format);
    };
    /**
     * @inheritdoc
     *
     * @param key
     * @param value
     */
    Request.prototype.setAttribute = function (key, value) {
        this._attributes[key] = value;
        return this;
    };
    /**
     * @inheritdoc
     *
     * @param key
     * @param defaultValue
     */
    Request.prototype.getAttribute = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        if (Object.keys(this._attributes).includes(key)) {
            return this._attributes[key];
        }
        return defaultValue;
    };
    /**
     * @inheritdoc
     *
     * @param name
     * @param resolver
     */
    Request.prototype.singleton = function (name, resolver) {
        return this.container.singleton(name, resolver);
    };
    /**
     * @inheritdoc
     *
     * @param name
     * @param resolver
     * @param singleton
     */
    Request.prototype.bind = function (name, resolver, singleton) {
        if (singleton === void 0) { singleton = false; }
        return this.container.bind(name, resolver, singleton);
    };
    /**
     * @inheritdoc
     *
     * @param name
     * @param instance
     * @param singleton
     */
    Request.prototype.instance = function (name, instance, singleton) {
        if (singleton === void 0) { singleton = false; }
        return this.container.instance(name, instance, singleton);
    };
    /**
     * @inheritdoc
     *
     * @param key
     */
    Request.prototype.get = function (key) {
        return this.container.get(key);
    };
    return Request;
}(http_1.IncomingMessage));
exports.Request = Request;
