import { ServerResponse } from "http";

export class Response extends ServerResponse {

    /**
     * The content to be send as response.
     * 
     * @var any
     */
    protected _content: string = "";

    /**
     * Sends the response to the client and closes the stream. Before
     * sending the content, we will set the appropriate Content-type and
     * Content-length header.
     */
    public send() {

        this.setHeader('Content-Length', this._content.length);

        this.end(this._content);
    }

    /**
     * Sets the response content/body
     * 
     * @param content 
     */
    public setContent(content: any) {
        this._content = content;
    }
}
