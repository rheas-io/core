"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var containerInstance_1 = require("./containerInstance");
var Container = /** @class */ (function () {
    function Container() {
        /**
         * KeyValue mapping of container bindings.
         *
         * @var object
         */
        this._instances = {};
    }
    /**
     * Creates a singleton binding for the key with a resolver.
     *
     * @param name
     * @param resolver
     */
    Container.prototype.singleton = function (name, resolver) {
        return this.bind(name, resolver, true);
    };
    /**
     * Creates a binding for the key with a resolver. The resolver will be run only
     * when the binding is requested.
     *
     * @param name
     * @param resolver
     * @param singleton
     */
    Container.prototype.bind = function (name, resolver, singleton) {
        var _this = this;
        if (singleton === void 0) { singleton = false; }
        return this.createInstance(name, function () {
            return containerInstance_1.ContainerInstance.createFromResolver(_this, resolver, singleton);
        });
    };
    /**
     * Creates a binding for the key with an object. The passed in object will be returned
     * when the binding is requested.
     *
     * @param name
     * @param instance
     * @param singleton
     */
    Container.prototype.instance = function (name, instance, singleton) {
        var _this = this;
        if (singleton === void 0) { singleton = false; }
        return this.createInstance(name, function () {
            return containerInstance_1.ContainerInstance.createFromInstance(_this, instance, singleton);
        });
    };
    /**
     * Creates a container instance and adds it to the binding list only if
     * a binding does not exists or it is not singleton.
     *
     * @param name
     * @param callback
     */
    Container.prototype.createInstance = function (name, callback) {
        var instance = this._instances[name];
        if (instance === undefined || !instance.isSingleton()) {
            instance = callback();
        }
        return this._instances[name] = instance;
    };
    /**
     * Returns the rheas binding of the specified key. Or returns null when
     * no binding is found or the defaultValue is not
     *
     * @param key The binding key to retreive
     */
    Container.prototype.get = function (key) {
        if (!this._instances.hasOwnProperty(key)) {
            return null;
        }
        return this._instances[key].getResolved();
    };
    return Container;
}());
exports.Container = Container;
