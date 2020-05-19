"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ContainerInstance = /** @class */ (function () {
    /**
     * Creates a container instance. The constructor is private and new instance
     * has to be created using the static functions so that necessary parameters
     * are loaded during object creation.
     *
     * @param container
     */
    function ContainerInstance(container) {
        /**
         * Flag to determine if this instance is modifiable or not.
         *
         * @var boolean
         */
        this._singleton = false;
        this._container = container;
    }
    /**
     * Creates an empty instance with no instance/resolver.
     *
     * @param container
     */
    ContainerInstance.createEmpty = function (container) {
        return new ContainerInstance(container);
    };
    /**
     * Creates an instance from an object. There is nothing to resolve in
     * this container instance. The passed instance value is the resolved value.
     *
     * @param container
     * @param instance
     * @param singleton
     */
    ContainerInstance.createFromInstance = function (container, instance, singleton) {
        if (singleton === void 0) { singleton = false; }
        return new ContainerInstance(container).setInstance(instance).setSingleton(singleton);
    };
    /**
     * Creates an instance from resolver callback function.
     *
     * @param container
     * @param resolver
     * @param singleton
     */
    ContainerInstance.createFromResolver = function (container, resolver, singleton) {
        if (singleton === void 0) { singleton = false; }
        return new ContainerInstance(container).setResolver(resolver).setSingleton(singleton);
    };
    /**
     * @inheritdoc
     *
     * @return
     */
    ContainerInstance.prototype.resolve = function () {
        if (typeof this._resolver === 'function') {
            this._resolved = this._resolver(this._container);
        }
        return this._resolved;
    };
    /**
     * @inheritdoc
     */
    ContainerInstance.prototype.unresolve = function () {
        if (this._singleton) {
            return;
        }
        this._resolved = undefined;
    };
    /**
     * @inheritdoc
     *
     * @param resolver
     */
    ContainerInstance.prototype.setResolver = function (resolver) {
        this._resolver = resolver;
        return this;
    };
    /**
     * @inheritdoc
     *
     * @param instance
     */
    ContainerInstance.prototype.setInstance = function (instance) {
        this._resolved = instance;
        return this;
    };
    /**
     * @inheritdoc
     *
     * @param status
     */
    ContainerInstance.prototype.setSingleton = function (status) {
        this._singleton = status;
        return this;
    };
    /**
     * @inheritdoc
     *
     * @return
     */
    ContainerInstance.prototype.isSingleton = function () {
        return this._singleton;
    };
    /**
     * @inheritdoc
     *
     * @return
     */
    ContainerInstance.prototype.getResolved = function () {
        if (this._resolved !== undefined) {
            return this._resolved;
        }
        return this.resolve();
    };
    return ContainerInstance;
}());
exports.ContainerInstance = ContainerInstance;
