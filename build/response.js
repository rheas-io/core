"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var cacheHeaders_1 = require("./cacheHeaders");
var helpers_1 = require("@rheas/support/helpers");
var Response = /** @class */ (function (_super) {
    __extends(Response, _super);
    /**
     * Creates a new response for the request.
     *
     * @param req
     */
    function Response(req) {
        var _this = _super.call(this, req) || this;
        /**
         * The response cache manager which handles cache related
         * headers.
         *
         * @var ICacheManager
         */
        _this._cache = null;
        /**
         * The content to be send as response.
         *
         * @var any
         */
        _this._content = "";
        _this._request = req;
        return _this;
    }
    /**
     * Sends the response to the client and closes the stream. Before
     * sending the content, we will set the appropriate Content-type and
     * Content-length header.
     *
     * @returns IResponse
     */
    Response.prototype.send = function () {
        this.end(this._content);
        return this;
    };
    /**
     * Alias of setContent
     *
     * @param content
     */
    Response.prototype.set = function (content) {
        return this.setContent(content);
    };
    /**
     * Sets a JSON content
     *
     * @param content
     */
    Response.prototype.json = function (content) {
        this._request.contents().setFormat('json');
        return this.setContent(JSON.stringify(content));
    };
    /**
     * Sets the response content/body
     *
     * @param content
     */
    Response.prototype.setContent = function (content) {
        this._content = content;
        return this;
    };
    /**
     * Returns the cache header manager of this response.
     *
     * @returns
     */
    Response.prototype.cache = function () {
        if (this._cache === null) {
            this._cache = new cacheHeaders_1.CacheHeaders();
        }
        return this._cache;
    };
    /**
     * Sets the content to empty and removes Content-Type, Content-Length and
     * Transfer-Encoding header.
     *
     * @returns this
     */
    Response.prototype.setEmptyContent = function () {
        this.setContent('');
        this.removeHeader('Content-Type');
        this.removeHeader('Content-Length');
        this.removeHeader('Transfer-Encoding');
        return this;
    };
    /**
     * Sets status as 304 and removes content and headers that are not
     * needed in a non-modified response.
     *
     * @return this
     */
    Response.prototype.setNotModified = function () {
        var _this = this;
        this.statusCode = 304;
        this.setContent('');
        this.headersNotNeededInNotModified().forEach(function (headerToRemove) { return _this.removeHeader(headerToRemove); });
        return this;
    };
    /**
     * Prepare content headers before dispatching to the client. Content
     * type, content length, charsets are all updated here.
     *
     * @param request
     */
    Response.prototype.prepareResponse = function () {
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
    };
    /**
     * Sets the content type based on the request format or the set
     * attribute _format value. If no format value is set, html format
     * is used and it's corresponding mimeType is used as content-type.
     */
    Response.prototype.prepareContentType = function () {
        if (this.hasHeader('Content-Type')) {
            return;
        }
        var format = this._request.contents().getFormat();
        var mimeType = this._request.contents().getMimeType(format);
        if (null !== mimeType) {
            this.setHeader('Content-Type', mimeType);
        }
    };
    /**
     * Sets the charset on text content-types. Charsets are read from
     * the configurations or default value UTF-8 is used.
     */
    Response.prototype.prepareCharset = function () {
        var contentType = this.getHeader('Content-Type');
        if (typeof contentType === 'string' && contentType.startsWith('text/')) {
            var charset = helpers_1.config('app.charset', 'UTF-8');
            this.setHeader('Content-Type', contentType + "; charset=" + charset);
        }
    };
    /**
     * Removes the content length if this is a large payload response
     * that is sent partially. Content length don't has to be sent when
     * the data is passed in chunks.
     */
    Response.prototype.prepareTransferEncoding = function () {
        if (this.hasHeader('Transfer-Encoding')) {
            this.removeHeader('Content-Length');
        }
    };
    /**
     * Removes the content from the response body if the request
     * is a HEAD request. Content length is kept as it is.
     */
    Response.prototype.prepareForHead = function () {
        if (this._request.getRealMethod() === 'HEAD') {
            this.setContent('');
        }
    };
    /**
     * Returns the headers that are not needed in Not-Modified responses.
     *
     * @returns array
     */
    Response.prototype.headersNotNeededInNotModified = function () {
        return [
            'Allow', 'Content-Encoding', 'Content-Language',
            'Content-Length', 'Content-MD5', 'Content-Type',
            'Last-Modified'
        ];
    };
    /**
     * Checks if the status given is a redirect status or not.
     *
     * @returns boolean
     */
    Response.prototype.isRedirectStatus = function (status) {
        return [201, 301, 302, 303, 307, 308].includes(status);
    };
    /**
     * Checks if the response is informational or not.
     *
     * @returns
     */
    Response.prototype.hasInformationalStatus = function () {
        return this.statusCode >= 100 && this.statusCode < 200;
    };
    /**
     * Checks if the response is empty ie 204-No Content or 304-Not Modified
     *
     * @returns
     */
    Response.prototype.hasEmptyStatus = function () {
        return [204, 304].includes(this.statusCode);
    };
    return Response;
}(http_1.ServerResponse));
exports.Response = Response;
