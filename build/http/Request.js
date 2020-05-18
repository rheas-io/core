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
var routing_1 = require("@rheas/routing");
var http_1 = require("http");
var container_1 = require("../container");
var serviceManager_1 = require("../serviceManager");
var errors_1 = require("../errors");
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
         * Stores the app instance.
         *
         * @var IApp
         */
        _this._app = null;
        /**
         * Stores the urldecoded query parameters of this request.
         *
         * @var StringObject
         */
        _this._query = {};
        _this.container = new container_1.Container();
        _this.serviceManager = new serviceManager_1.ServiceManager(_this);
        return _this;
    }
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
     * @param defaultValue
     */
    Request.prototype.get = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        return this.container.get(key, defaultValue);
    };
    /**
     * Sets the application instance and boots request services
     * and container.
     *
     * @param app
     */
    Request.prototype.boot = function (app) {
        this.loadRequest();
        this._app = app;
        this.instance('app', this._app, true);
        this.loadServices(this._app);
        return this;
    };
    /**
     * Loads the requests query, cookies, headers and post contents.
     */
    Request.prototype.loadRequest = function () {
        this.loadQuery();
    };
    /**
     * Loads the request query from the url. The result is urldecoded
     * query stores as key value pairs.
     */
    Request.prototype.loadQuery = function () {
        this._query = url_1.default.parse(this.url || "", true).query;
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
     * Returns the application instance.
     *
     * @returns IApp
     */
    Request.prototype.app = function () {
        return this._app;
    };
    /**
     * Gets the method
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
     * Returns overridden method if any exists.
     *
     * @return string
     */
    Request.prototype.overriddenMethod = function () {
        var method = this.headers['X-HTTP-METHOD-OVERRIDE'];
        if (!method) {
        }
        if (!routing_1.Route.verbs.includes(method)) {
            throw new errors_1.SuspiciousOperationException("Invalid method requested: " + method);
        }
        return method;
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
    Request.prototype.acceptsJson = function () {
        throw new Error("Method not implemented.");
    };
    Request.prototype.getHost = function () {
        throw new Error("Method not implemented.");
    };
    Request.prototype.getPath = function () {
        throw new Error("Method not implemented.");
    };
    Request.prototype.getPathComponents = function () {
        throw new Error("Method not implemented.");
    };
    Request.prototype.getFullUrl = function () {
        throw new Error("Method not implemented.");
    };
    Request.prototype.getQueryString = function () {
        throw new Error("Method not implemented.");
    };
    return Request;
}(http_1.IncomingMessage));
exports.Request = Request;
