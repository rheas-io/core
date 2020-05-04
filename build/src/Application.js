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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var ApplicationBase_1 = require("./ApplicationBase");
var Application = /** @class */ (function (_super) {
    __extends(Application, _super);
    function Application(rootPath) {
        var _this = _super.call(this) || this;
        _this.rootPath = rootPath;
        _this.configObject = { app: { port: 3000 } }; //require(path.resolve(rootPath, 'config')).default;
        return _this;
    }
    /**
     * @inheritdoc
     */
    Application.prototype.boot = function () {
    };
    /**
     * @inheritdoc
     */
    Application.prototype.config = function (key) {
        throw new Error("Method not implemented.");
    };
    /**
     * @inheritdoc
     */
    Application.prototype.getConfigurations = function () {
        return this.configObject;
    };
    /**
     * @inheritdoc
     */
    Application.prototype.getRootPath = function () {
        return this.rootPath;
    };
    /**
     * @inheritdoc
     * //TODO read asset path from config, or a property with setter
     * and getter that can be set in the extended class
     */
    Application.prototype.getAssetPath = function () {
        return path_1.default.resolve(this.rootPath, '..', 'assets');
    };
    return Application;
}(ApplicationBase_1.ApplicationBase));
exports.default = Application;
