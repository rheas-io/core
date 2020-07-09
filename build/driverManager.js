"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var invalidArgument_1 = require("@rheas/errors/invalidArgument");
var DriverManager = /** @class */ (function () {
    function DriverManager() {
        /**
         * Stores the manager driver instances.
         *
         * @var object
         */
        this.drivers = {};
    }
    /**
     * Registers a driver instance to the given name. If force is false
     * and an instance already exists for the key, then it won't be replaced.
     *
     * @param name
     * @param driver
     * @param force
     */
    DriverManager.prototype.registerDriver = function (name, driver, force) {
        if (force || !this.drivers[name]) {
            this.drivers[name] = driver;
        }
    };
    /**
     * Returns the driver instance for the name.
     *
     * @param name
     */
    DriverManager.prototype.getDriver = function (name) {
        var driverInstance = this.drivers[name];
        if (!driverInstance) {
            throw new invalidArgument_1.InvalidArgumentException("Driver " + name + " is not registered.");
        }
        return driverInstance;
    };
    return DriverManager;
}());
exports.DriverManager = DriverManager;
