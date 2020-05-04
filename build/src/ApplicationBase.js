"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Request_1 = require("./http/Request");
var Response_1 = require("./http/Response");
var http_1 = __importDefault(require("http"));
/**
 *
 */
var ApplicationBase = /** @class */ (function () {
    function ApplicationBase() {
        /**
         * Sets the application boot status
         */
        this.booted = false;
    }
    /**
     * Returns the boot status of this application
     *
     * @return boolean
     */
    ApplicationBase.prototype.isBooted = function () {
        return this.booted;
    };
    /**
     *
     * @param req
     * @param res
     */
    ApplicationBase.prototype.requestHandler = function (req, res) {
        var request = req;
        var response = res;
        console.log(request.url || "");
        //console.log(request.url = decodeURI(request.url || ""));
        //console.log(request.url = decodeURI(request.url || ""));
        console.log(req.url = decodeURIComponent(request.url || ""));
        console.log(req.url = decodeURIComponent(request.url || ""));
        response.sendHelloWorld();
    };
    /**
     * Starts the express aplication and listen for requests
     * from clients on the port defined in the configuration.
     */
    ApplicationBase.prototype.startApp = function () {
        var _this = this;
        // Boot the application before starting the server
        if (!this.isBooted()) {
            this.boot();
        }
        // Establish connection to the database before opening a 
        // port. On successfull connection, open a port and listen to
        // requests. Otherwise, log the error and exit the process.
        this.listenRequests();
        return;
        this.initDbConnection()
            .then(function () { return _this.listenRequests(); })
            .catch(function (error) {
            console.error("Error connecting to database. Server not started.");
            console.error(error);
            process.exit(1);
        });
    };
    /**
     * Reads the app db configuration and connect using the
     * connector specified in the configuration. Override this
     * function if the user don't want to use the connector given in the
     * config file.
     */
    ApplicationBase.prototype.initDbConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dbConfig;
            return __generator(this, function (_a) {
                dbConfig = this.getConfigurations().db;
                return [2 /*return*/, dbConfig.connector.connect(dbConfig)];
            });
        });
    };
    /**
     * Initiate server to listen to client requests. This
     * function listens to a port on the server.
     */
    ApplicationBase.prototype.listenRequests = function () {
        var _this = this;
        var config = this.getConfigurations();
        var port = this.normalizePort(config.app.port);
        var server = http_1.default.createServer({
            IncomingMessage: Request_1.Request,
            ServerResponse: Response_1.Response
        }, this.requestHandler);
        server.listen(port);
        server.on('listening', function () { return _this.onListening(server); });
        server.on('error', function (error) { return _this.onError(error, port); });
    };
    /**
     * Convert port inputs into an integer value
     *
     * @param val Port value
     */
    ApplicationBase.prototype.normalizePort = function (val) {
        var port = parseInt(val, 10);
        return isNaN(port) ? val : (port >= 0 ? port : false);
    };
    /**
     * Error callback to show pretty human readable
     * error message.
     *
     * @param error
     */
    ApplicationBase.prototype.onError = function (error, port) {
        if (error.syscall !== 'listen') {
            throw error;
        }
        var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
            default:
                throw error;
        }
    };
    /**
     * Server connection success callback. Log the connection
     * success messages.
     */
    ApplicationBase.prototype.onListening = function (server) {
        var addr = server.address();
        if (addr != null) {
            var bind = typeof addr == 'string' ? 'pipe ' + addr : 'port ' + addr.port;
            console.log('Listening on ' + bind);
        }
    };
    return ApplicationBase;
}());
exports.ApplicationBase = ApplicationBase;
