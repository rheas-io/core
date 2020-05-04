"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Application_1 = __importDefault(require("./Application"));
var BindingType;
(function (BindingType) {
    BindingType[BindingType["SINGLETON"] = 1] = "SINGLETON";
    BindingType[BindingType["OTHER"] = 2] = "OTHER";
})(BindingType || (BindingType = {}));
/**
 * Laress container stores app specific singleton instances
 * and other service provider bindings. There may be instances
 * where we need to access certain objects from framework
 * methods and as well as implementing application methods. This
 * container facilitates storage of such instances.
 */
var Laress = /** @class */ (function () {
    function Laress() {
        /**
         * Holds all the laress app bindings. Inorder to avoid polluting
         * this objects properties, we will be using the bindings object
         * for storing the bindings
         */
        this.bindings = {};
    }
    /**
     * Entry point of the laress application. This function looks
     * for the app binding. If it is bound to a valid Application
     * instance, the app starts listening to requests.
     */
    Laress.prototype.startServer = function () {
        var app = this.get('app');
        if (!(app instanceof Application_1.default)) {
            throw Error('A valid app instance is not found. Read docs for binding app instance.');
        }
        app.startApp();
    };
    /**
     * Binds a singleton class to this container.
     *
     * @param name Container binding key
     * @param callback The value returned by this callback will be bound to the key
     */
    Laress.prototype.singleton = function (name, callback) {
        this.validateBindingAllowed(name);
        var resultInstance = callback(this.get('app', null));
        this.bindings[name] = {
            type: BindingType.SINGLETON,
            instance: resultInstance
        };
        return resultInstance;
    };
    /**
     * Binds an instance to the container for the key "name".
     * Returns the same instance.
     *
     * @param name
     * @param instance
     */
    Laress.prototype.instance = function (name, instance) {
        this.validateBindingAllowed(name);
        this.bindings[name] = { type: BindingType.OTHER, instance: instance };
        return instance;
    };
    /**
     * Check if the binding is allowed or not and throw an
     * exception if it is not allowed.
     *
     * @param name
     */
    Laress.prototype.validateBindingAllowed = function (name) {
        if (!this.isBindingModifiable(name)) {
            throw new Error("A singleton binding already exists for the key " + name);
        }
    };
    /**
     * Determine if a binding is modifiable or not. Singleton bindings
     * should not be modifiable.
     *
     * @param name
     */
    Laress.prototype.isBindingModifiable = function (name) {
        if (!this.bindings.hasOwnProperty(name)) {
            return true;
        }
        var binding = this.bindings[name];
        return BindingType.SINGLETON !== binding.type;
    };
    /**
     * Returns the laress binding of the specified key. Or throws an
     * exception when no defaultValue is submitted and no binding is
     * found.
     *
     * @param key The binding key to retreive
     * @param defaultValue The default value to return, if no bindings found
     */
    Laress.prototype.get = function (key, defaultValue) {
        if (!this.bindings.hasOwnProperty(key)) {
            if (typeof defaultValue !== 'undefined') {
                return defaultValue;
            }
            throw new Error("No binding found for the key " + key);
        }
        return this.bindings[key].instance;
    };
    return Laress;
}());
exports.Laress = Laress;
// This container should be a singleton instance.
exports.laress = new Laress();
