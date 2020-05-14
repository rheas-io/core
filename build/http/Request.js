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
var Request = /** @class */ (function (_super) {
    __extends(Request, _super);
    function Request() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Request.prototype.boot = function (app) {
        throw new Error("Method not implemented.");
    };
    Request.prototype.app = function () {
        throw new Error("Method not implemented.");
    };
    Request.prototype.acceptsJson = function () {
        throw new Error("Method not implemented.");
    };
    Request.prototype.isSecure = function () {
        throw new Error("Method not implemented.");
    };
    Request.prototype.getSchema = function () {
        throw new Error("Method not implemented.");
    };
    Request.prototype.getHost = function () {
        throw new Error("Method not implemented.");
    };
    Request.prototype.getPath = function () {
        throw new Error("Method not implemented.");
    };
    Request.prototype.getPathComponents = function () {
        throw new Error("Method not implemented.");
    };
    Request.prototype.getFullUrl = function () {
        throw new Error("Method not implemented.");
    };
    Request.prototype.getQueryString = function () {
        throw new Error("Method not implemented.");
    };
    Request.prototype.getMethod = function () {
        throw new Error("Method not implemented.");
    };
    Request.prototype.getRealMethod = function () {
        throw new Error("Method not implemented.");
    };
    return Request;
}(http_1.IncomingMessage));
exports.Request = Request;
