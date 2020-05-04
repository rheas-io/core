import { ServerResponse } from "http";

export class Response extends ServerResponse {

    public sendHelloWorld() {
        this.statusCode = 200;
        this.end("Hello world");
    }

}
