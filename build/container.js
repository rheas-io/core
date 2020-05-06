"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var Container = /** @class */ (function () {
    function Container() {
        /**
         * Holds all the laress app bindings. Inorder to avoid polluting
         * this objects properties, we will be using the bindings object
         * for storing the bindings
         */
        this.bindings = {};
    }
    /**
     * Creates a singleton instance of the application if it does not
     * exist and returns it.
     *
     * @returns IContainer
     */
    Container.instance = function () {
        if (Container._instance === null) {
            Container._instance = new Container();
        }
        return Container._instance;
    };
    /**
     * Sets the global container instance
     *
     * @param container
     */
    Container.setInstance = function (container) {
        Container._instance = container;
    };
    /**
     * Binds a singleton class to this container.
     *
     * @param name Container binding key
     * @param callback The value returned by this callback will be bound to the key
     */
    Container.prototype.singleton = function (name, callback) {
        this.validateBindingAllowed(name);
        var resultInstance = callback(this);
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
    Container.prototype.instance = function (name, instance) {
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
    Container.prototype.validateBindingAllowed = function (name) {
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
    Container.prototype.isBindingModifiable = function (name) {
        if (!this.bindings.hasOwnProperty(name)) {
            return true;
        }
        var binding = this.bindings[name];
        return BindingType.SINGLETON !== binding.type;
    };
    /**
     * Returns the laress binding of the specified key. Or returns null when
     * no binding is found or the defaultValue is not
     *
     * @param key The binding key to retreive
     * @param defaultValue The default value to return, if no bindings found
     */
    Container.prototype.get = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        if (!this.bindings.hasOwnProperty(key)) {
            return defaultValue === undefined ? null : defaultValue;
        }
        return this.bindings[key].instance;
    };
    /**
     * Singleton instance of the laress application
     *
     * @var IContainer
     */
    Container._instance = null;
    return Container;
}());
exports.Container = Container;
