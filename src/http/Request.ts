import { IncomingMessage } from "http";
import { IRequest } from "@laress/contracts";

export class Request extends IncomingMessage implements IRequest {
    isSecure(): boolean {
        throw new Error("Method not implemented.");
    }
    getSchema(): string {
        throw new Error("Method not implemented.");
    }
    getHost(): string {
        throw new Error("Method not implemented.");
    }
    getPath(): string {
        throw new Error("Method not implemented.");
    }
    getPathComponents(): import("@laress/contracts/routes/uri").IUriComponent[] {
        throw new Error("Method not implemented.");
    }
    getFullUrl(): string {
        throw new Error("Method not implemented.");
    }
    getQueryString(): string {
        throw new Error("Method not implemented.");
    }
    getMethod(): string {
        throw new Error("Method not implemented.");
    }
    getRealMethod(): string {
        throw new Error("Method not implemented.");
    }

}