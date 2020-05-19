import url from "url";
import { IncomingMessage } from "http";
import { Container } from "../container";
import { IApp } from "@rheas/contracts/core";
import { ServiceManager } from "../serviceManager";
import { IRequest, AnyObject } from "@rheas/contracts";
import { SuspiciousOperationException } from "../errors";
import { IServiceManager } from "@rheas/contracts/services";
import { IRequestComponent } from "@rheas/contracts/routes/uri";
import { IContainer, InstanceHandler, IContainerInstance } from "@rheas/contracts/container";

export class Request extends IncomingMessage implements IRequest {

    /**
     * Stores the app instance.
     * 
     * @var IApp
     */
    protected _app: IApp | null = null;

    /**
     * This request's container manager
     * 
     * @var IContainer
     */
    protected container: IContainer;

    /**
     * Manages all the request specific services
     * 
     * @var IServiceManager
     */
    protected serviceManager: IServiceManager;

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

        this.container = new Container();
        this.serviceManager = new ServiceManager(this);
    }

    /**
     * @inheritdoc
     * 
     * @param name 
     * @param resolver 
     */
    public singleton(name: string, resolver: InstanceHandler): IContainerInstance {
        return this.container.singleton(name, resolver);
    }

    /**
     * @inheritdoc
     * 
     * @param name 
     * @param resolver 
     * @param singleton 
     */
    public bind(name: string, resolver: InstanceHandler, singleton: boolean = false): IContainerInstance {
        return this.container.bind(name, resolver, singleton);
    }

    /**
     * @inheritdoc
     * 
     * @param name 
     * @param instance 
     * @param singleton 
     */
    public instance<T>(name: string, instance: T, singleton: boolean = false): IContainerInstance {
        return this.container.instance(name, instance, singleton);
    }

    /**
     * @inheritdoc
     * 
     * @param key 
     */
    public get(key: string) {
        return this.container.get(key);
    }

    /**
     * Sets the application instance and boots request services
     * and container.
     * 
     * @param app 
     */
    public boot(app: IApp): IRequest {

        this.loadRequest();

        this._app = app;
        this.instance('app', this._app, true);

        this.loadServices(this._app);

        return this;
    }

    /**
     * Loads the requests query, cookies, headers and post contents.
     */
    private loadRequest(): void {

        this.loadQuery();

        this.loadBody();
    }

    /**
     * Loads the request query from the url. The result is urldecoded
     * query stores as key value pairs.
     */
    private loadQuery(): void {
        this._query = url.parse(this.url || "", true).query;
    }

    /**
     * 
     */
    private loadBody(): void {

    }

    /**
     * Loads the request services and boots them.
     * 
     * @param app 
     */
    private loadServices(app: IApp) {
        this.serviceManager.setProviders(app.config('request.providers') || {});

        this.serviceManager.boot();
    }

    /**
     * Returns the application instance.
     * 
     * @returns IApp
     */
    public app(): IApp | null {
        return this._app;
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

    params(): string[] {
        throw new Error("Method not implemented.");
    }

    acceptsJson(): boolean {
        throw new Error("Method not implemented.");
    }
    getHost(): string {
        throw new Error("Method not implemented.");
    }
    getPath(): string {
        throw new Error("Method not implemented.");
    }
    getPathComponents(): IRequestComponent[] {
        throw new Error("Method not implemented.");
    }
    getFullUrl(): string {
        throw new Error("Method not implemented.");
    }
    getQueryString(): string {
        throw new Error("Method not implemented.");
    }
}
