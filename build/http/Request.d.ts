/// <reference types="node" />
import { IncomingMessage } from "http";
import { IRequest } from "@rheas/contracts";
export declare class Request extends IncomingMessage implements IRequest {
    boot(app: import("@rheas/contracts/core").IApp): IRequest;
    app(): import("@rheas/contracts/core").IApp | null;
    acceptsJson(): boolean;
    isSecure(): boolean;
    getSchema(): string;
    getHost(): string;
    getPath(): string;
    getPathComponents(): import("@rheas/contracts/routes/uri").IUriComponent[];
    getFullUrl(): string;
    getQueryString(): string;
    getMethod(): string;
    getRealMethod(): string;
}
