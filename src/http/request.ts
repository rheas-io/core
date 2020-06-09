import url from "url";
import mime from "mime-types";
import { IncomingMessage } from "http";
import { Container } from "../container";
import { ServiceManager } from "../serviceManager";
import { RequestComponent } from "@rheas/routing/uri";
import { IApp, IRedirector } from "@rheas/contracts/core";
import { IServiceManager } from "@rheas/contracts/services";
import { IRequestComponent } from "@rheas/contracts/routes/uri";
import { IRequest, IResponse, AnyObject } from "@rheas/contracts";
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
     * Stores the urldecoded query parameters of this request.
     * 
     * @var StringObject
     */
    protected _query: AnyObject = {};

    /**
     * Creates a new server request.
     * 
     * @param socket 
     */
    constructor(socket: any) {
        super(socket);

        this._container = new Container();
        this._serviceManager = new ServiceManager(this);
    }
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
    public boot(app: IApp, response: IResponse): IRequest {

        this.instance('app', app, true);
        this.instance('response', response, true);
        this.instance('services', this._serviceManager, true);

        this.loadRequest();

        this._serviceManager.setProviders(app.config('request.providers', {}));

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

        this.loadBody();
    }

    /**
     * 
     */
    private loadBody(): void {

    }

    /**
     * @inheritdoc
     * 
     * @return IRedirector
     */
    public redirect(): IRedirector {
        return this.get('redirect');
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
     * 
     * 
     * @returns string
     */
    public getPath(): string {
        return <string>this.url;
    }
    //TODO
    public getProtocol(): string {
        return this.isSecure() ? 'https' : 'http';
    }
    //TODO
    public getHost(): string {
        return this.headers.host || '';
    }
    //TODO
    public getFullUrl(): string {
        return this.getProtocol() + '://' + this.getHost() + this.getPath();
    }
    //TODO
    public getQueryString(): string {
        throw new Error("Method not implemented.");
    }
    //TODO
    public params(): string[] {
        let params: string[] = [];

        this.getPathComponents().forEach(
            components => params.push(...Object.values(components.getParam()))
        );

        return params;
    }

    isJson(): boolean {
        throw new Error("Method not implemented.");
    }

    acceptsJson(): boolean {
        throw new Error("Method not implemented.");
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
     * @inheritdoc
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
     * @inheritdoc
     * 
     * @param format 
     * @return
     */
    public getMimeType(format: string): string | null {
        return mime.lookup(format) || null;
    }

    /**
     * @inheritdoc
     * 
     * @param key 
     * @param value 
     */
    public setAttribute(key: string, value: any): IRequest {

        this._attributes[key] = value;

        return this;
    }

    /**
     * @inheritdoc
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
     * @inheritdoc
     * 
     * @param name 
     * @param resolver 
     */
    public singleton(name: string, resolver: InstanceHandler): IContainerInstance {
        return this._container.singleton(name, resolver);
    }

    /**
     * @inheritdoc
     * 
     * @param name 
     * @param resolver 
     * @param singleton 
     */
    public bind(name: string, resolver: InstanceHandler, singleton: boolean = false): IContainerInstance {
        return this._container.bind(name, resolver, singleton);
    }

    /**
     * @inheritdoc
     * 
     * @param name 
     * @param instance 
     * @param singleton 
     */
    public instance<T>(name: string, instance: T, singleton: boolean = false): IContainerInstance {
        return this._container.instance(name, instance, singleton);
    }

    /**
     * @inheritdoc
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
