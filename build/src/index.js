"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var laress_1 = require("./laress");
var Application_1 = __importDefault(require("./Application"));
laress_1.laress.singleton('app', function () { return new Application_1.default(path_1.default.resolve(__dirname)); });
laress_1.laress.startServer();
