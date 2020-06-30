/// <reference types="node" />
import { ServerResponse } from "http";
import { IRequest, IResponse, AnyObject } from "@rheas/contracts";
export declare class Response extends ServerResponse implements IResponse {
    /**
     * The request object to which this response was created.
     *
     * @var IRequest
     */
    protected _request: IRequest;
    /**
     * The content to be send as response.
     *
     * @var any
     */
    protected _content: string;
    /**
     * Creates a new response for the request.
     *
     * @param req
     */
    constructor(req: IRequest);
    /**
     * Sends the response to the client and closes the stream. Before
     * sending the content, we will set the appropriate Content-type and
     * Content-length header.
     *
     * @returns IResponse
     */
    send(): IResponse;
    /**
     * Alias of setContent
     *
     * @param content
     */
    set(content: any): IResponse;
    /**
     * Sets a JSON content
     *
     * @param content
     */
    json(content: AnyObject): IResponse;
    /**
     * Sets the response content/body
     *
     * @param content
     */
    setContent(content: any): IResponse;
    /**
     * Sets the content to empty and removes Content-Type, Content-Length and
     * Transfer-Encoding header.
     *
     * @returns this
     */
    setEmptyContent(): IResponse;
    /**
     * Sets status as 304 and removes content and headers that are not
     * needed in a non-modified response.
     *
     * @return this
     */
    setNotModified(): IResponse;
    /**
     * Prepare content headers before dispatching to the client. Content
     * type, content length, charsets are all updated here.
     *
     * @param request
     */
    prepareResponse(): IResponse;
    /**
     * Sets the content type based on the request format or the set
     * attribute _format value. If no format value is set, html format
     * is used and it's corresponding mimeType is used as content-type.
     */
    private prepareContentType;
    /**
     * Sets the charset on text content-types. Charsets are read from
     * the configurations or default value UTF-8 is used.
     */
    private prepareCharset;
    /**
     * Removes the content length if this is a large payload response
     * that is sent partially. Content length don't has to be sent when
     * the data is passed in chunks.
     */
    private prepareTransferEncoding;
    /**
     * Removes the content from the response body if the request
     * is a HEAD request. Content length is kept as it is.
     */
    private prepareForHead;
    /**
     * Creates a redirect response to the given url and status. If no
     * status code is given, 302 is used by default.
     *
     * @param to
     * @param status
     */
    redirect(to: string, status?: number): IResponse;
    /**
     * @inheritdoc
     *
     * @returns array
     */
    headersNotNeededInNotModified(): string[];
    /**
     * Checks if the status given is a redirect status or not.
     *
     * @returns boolean
     */
    isRedirectStatus(status: number): boolean;
    /**
     * Checks if the response is informational or not.
     *
     * @returns
     */
    hasInformationalStatus(): boolean;
    /**
     * Checks if the response is empty ie 204-No Content or 304-Not Modified
     *
     * @returns
     */
    hasEmptyStatus(): boolean;
}
