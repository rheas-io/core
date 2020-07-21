"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mime_types_1 = __importDefault(require("mime-types"));
const accepts_1 = __importDefault(require("accepts"));
class RequestContent {
    /**
     *
     * @param request
     */
    constructor(request) {
        /**
         * The accept instance that has to be used for negotiations.
         *
         * @var Accepts
         */
        this._negotiator = null;
        /**
         * Stores request attributes. Attributes are how new fields are
         * entered into request.
         *
         * @var AnyObject
         */
        this._attributes = {};
        /**
         * The format in which response has to be sent.
         *
         * @var string
         */
        this._format = null;
        this._request = request;
    }
    /**
     * Returns true if the request is an AJAX request.
     *
     * @returns
     */
    ajax() {
        return 'XMLHttpRequest' === this._request.headers['X-Requested-With'];
    }
    /**
     * Returns true if the request is a PJAX request.
     *
     * @returns
     */
    pjax() {
        return 'true' === this._request.headers['X-PJAX'];
    }
    /**
     * Returns true if the request accepts the given type.
     *
     * @param type
     */
    accepts(type) {
        return false !== this.negotiator().type(type);
    }
    /**
     * Returns true if the request conten-type is a json
     *
     * @returns
     */
    isJson() {
        const content_type = this._request.headers["content-type"];
        if (content_type) {
            return content_type.includes('/json') || content_type.includes('+json');
        }
        return false;
    }
    /**
     * Returns true if the request accepts json
     *
     * @returns
     */
    acceptsJson() {
        return (this.ajax() && !this.pjax() && this.acceptsAnyType()) || this.wantsJson();
    }
    /**
     * Returns true if the request is specifically asking for json. Mimetype for
     * json content is either
     *
     * [1] application/json
     * [2] application/problem+json
     *
     * We will check for the presence of "/json" and "+json" strings. We use the string
     * check as the negotiator might return true even if the client is not requesting
     * for it but accepts any type "*"
     *
     * @returns
     */
    wantsJson() {
        const types = this.acceptableContentTypes();
        if (types.length > 0) {
            return types[0].includes('/json') || types[0].includes('+json');
        }
        return false;
    }
    /**
     * Returns true if the request accepts any content type
     *
     * @returns
     */
    acceptsAnyType() {
        const types = this.acceptableContentTypes();
        return types.includes('*/*') || types.includes('*');
    }
    /**
     * Returns the acceptable content types in the quality order.
     * Most preferred are returned first.
     *
     * @returns
     */
    acceptableContentTypes() {
        return this.negotiator().types();
    }
    /**
     * Returns the negotiator instance.
     *
     * @returns
     */
    negotiator() {
        if (this._negotiator === null) {
            this._negotiator = accepts_1.default(this._request);
        }
        return this._negotiator;
    }
    /**
     * Returns the mimetype of the format. null if no mime found.
     *
     * @param format
     * @return
     */
    getMimeType(format) {
        return mime_types_1.default.lookup(format) || null;
    }
    /**
     * Sets the format in which response has to be send.
     *
     * @param format
     */
    setFormat(format) {
        this._format = format;
        return this;
    }
    /**
     * Gets the request format set by the application. Setting a custom format
     * to the request overrides the accept header.
     *
     * For instance, if accept header allows both html and json and the server
     * want to send json, application can set "json" as the request format and
     * the response will have json content-type.
     *
     * @returns string
     */
    getFormat(defaulValue = "html") {
        if (null == this._format) {
            this._format = this.getAttribute('_format');
        }
        return null == this._format ? defaulValue : this._format;
    }
    /**
     * Sets an attribute value. This enables setting custom values on request
     * that are not actually present in the incoming request.
     *
     * @param key
     * @param value
     */
    setAttribute(key, value) {
        this._attributes[key] = value;
        return this;
    }
    /**
     * Gets an attribute value if it exists or the defaultValue or null if no
     * default is given.
     *
     * @param key
     * @param defaultValue
     */
    getAttribute(key, defaultValue = null) {
        if (this._attributes.hasOwnProperties(key)) {
            return this._attributes[key];
        }
        return defaultValue;
    }
}
exports.RequestContent = RequestContent;
