/// <reference types="node" />
import { IncomingMessage } from "http";
import { IRequest } from "@laress/contracts";
export declare class Request extends IncomingMessage implements IRequest {
    parseUrl(url: string): void;
}
