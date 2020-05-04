/// <reference types="node" />
import { IncomingMessage } from "http";
import { IRequest } from "@laress/contracts";
export declare class Request extends IncomingMessage implements IRequest {
    isSecure(): boolean;
    getSchema(): string;
    getHost(): string;
    getPath(): string;
    getPathComponents(): import("@laress/contracts/routes/uri").IUriComponent[];
    getFullUrl(): string;
    getQueryString(): string;
    getMethod(): string;
    getRealMethod(): string;
}
