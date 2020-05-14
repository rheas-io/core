import { IncomingMessage } from "http";
import { IRequest } from "@rheas/contracts";

export class Request extends IncomingMessage implements IRequest {
    boot(app: import("@rheas/contracts/core").IApp): IRequest {
        throw new Error("Method not implemented.");
    }
    app(): import("@rheas/contracts/core").IApp | null {
        throw new Error("Method not implemented.");
    }
    acceptsJson(): boolean {
        throw new Error("Method not implemented.");
    }
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
    getPathComponents(): import("@rheas/contracts/routes/uri").IUriComponent[] {
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
