"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const headers_1 = require("./headers");
const http_1 = require("http");
const helpers_1 = require("@rheas/support/helpers");
class Response extends http_1.ServerResponse {
    /**
     * Creates a new response for the request.
     *
     * @param req
     */
    constructor(req) {
        super(req);
        /**
         * The content to be send as response.
         *
         * @var any
         */
        this._content = "";
        this._request = req;
        this._headers = new headers_1.Headers();
    }
    /**
     * Sends the response to the client and closes the stream. Before
     * sending the content, we will set the appropriate Content-type and
     * Content-length header.
     *
     * @returns IResponse
     */
    send() {
        this.end(this._content);
        return this;
    }
    /**
     * Alias of setContent
     *
     * @param content
     */
    set(content) {
        return this.setContent(content);
    }
    /**
     * Sets a JSON content
     *
     * @param content
     */
    json(content) {
        this._request.contents().setFormat('json');
        return this.setContent(JSON.stringify(content));
    }
    /**
     * Sets the response content/body
     *
     * @param content
     */
    setContent(content) {
        this._content = content;
        return this;
    }
    /**
     * Returns the cache header manager of this response.
     *
     * @returns
     */
    cache() {
        return this._headers;
    }
    /**
     * Sets the content to empty and removes Content-Type, Content-Length and
     * Transfer-Encoding header.
     *
     * @returns this
     */
    setEmptyContent() {
        this.setContent('');
        this.removeHeader('Content-Type');
        this.removeHeader('Content-Length');
        this.removeHeader('Transfer-Encoding');
        return this;
    }
    /**
     * Sets status as 304 and removes content and headers that are not
     * needed in a non-modified response.
     *
     * @return this
     */
    setNotModified() {
        this.statusCode = 304;
        this.setContent('');
        this.headersNotNeededInNotModified().forEach(headerToRemove => this.removeHeader(headerToRemove));
        return this;
    }
    /**
     * Prepare content headers before dispatching to the client. Content
     * type, content length, charsets are all updated here.
     *
     * @param request
     */
    prepareResponse() {
        //this.setHeader('Content-Length', this._content.length);
        if (this.hasInformationalStatus() || this.hasEmptyStatus()) {
            this.setEmptyContent();
        }
        // If there is a valid content, set the appropriate content-type
        // content-encoding etc if these does not exists. Also check for
        // chunk response and head request.
        else {
            this.prepareContentType();
            this.prepareCharset();
            this.prepareTransferEncoding();
            this.prepareForHead();
        }
        return this;
    }
    /**
     * Sets the content type based on the request format or the set
     * attribute _format value. If no format value is set, html format
     * is used and it's corresponding mimeType is used as content-type.
     */
    prepareContentType() {
        if (this.hasHeader('Content-Type')) {
            return;
        }
        const format = this._request.contents().getFormat();
        const mimeType = this._request.contents().getMimeType(format);
        if (null !== mimeType) {
            this.setHeader('Content-Type', mimeType);
        }
    }
    /**
     * Sets the charset on text content-types. Charsets are read from
     * the configurations or default value UTF-8 is used.
     */
    prepareCharset() {
        const contentType = this.getHeader('Content-Type');
        if (typeof contentType === 'string' && contentType.startsWith('text/')) {
            const charset = helpers_1.config('app.charset', 'UTF-8');
            this.setHeader('Content-Type', `${contentType}; charset=${charset}`);
        }
    }
    /**
     * Removes the content length if this is a large payload response
     * that is sent partially. Content length don't has to be sent when
     * the data is passed in chunks.
     */
    prepareTransferEncoding() {
        if (this.hasHeader('Transfer-Encoding')) {
            this.removeHeader('Content-Length');
        }
    }
    /**
     * Removes the content from the response body if the request
     * is a HEAD request. Content length is kept as it is.
     */
    prepareForHead() {
        if (this._request.getRealMethod() === 'HEAD') {
            this.setContent('');
        }
    }
    /**
     * Returns the headers that are not needed in Not-Modified responses.
     *
     * @returns array
     */
    headersNotNeededInNotModified() {
        return [
            'Allow', 'Content-Encoding', 'Content-Language',
            'Content-Length', 'Content-MD5', 'Content-Type',
            'Last-Modified'
        ];
    }
    /**
     * Checks if the status given is a redirect status or not.
     *
     * @returns boolean
     */
    isRedirectStatus(status) {
        return [201, 301, 302, 303, 307, 308].includes(status);
    }
    /**
     * Checks if the response is informational or not.
     *
     * @returns
     */
    hasInformationalStatus() {
        return this.statusCode >= 100 && this.statusCode < 200;
    }
    /**
     * Checks if the response is empty ie 204-No Content or 304-Not Modified
     *
     * @returns
     */
    hasEmptyStatus() {
        return [204, 304].includes(this.statusCode);
    }
}
exports.Response = Response;
