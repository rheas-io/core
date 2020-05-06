import { InstanceHandler, IContainer } from "@laress/contracts/core";
/**
 * Laress container stores app specific singleton instances
 * and other service provider bindings. There may be instances
 * where we need to access certain objects from framework
 * methods and as well as implementing application methods. This
 * container facilitates storage of such instances.
 */
export declare class Container implements IContainer {
    /**
     * Singleton instance of the laress application
     *
     * @var IContainer
     */
    private static _instance;
    /**
     * Holds all the laress app bindings. Inorder to avoid polluting
     * this objects properties, we will be using the bindings object
     * for storing the bindings
     */
    private bindings;
    /**
     * Creates a singleton instance of the application if it does not
     * exist and returns it.
     *
     * @returns IContainer
     */
    static instance(): IContainer;
    /**
     * Sets the global container instance
     *
     * @param container
     */
    static setInstance(container: IContainer): void;
    /**
     * Binds a singleton class to this container.
     *
     * @param name Container binding key
     * @param callback The value returned by this callback will be bound to the key
     */
    singleton<T>(name: string, callback: InstanceHandler<T>): T;
    /**
     * Binds an instance to the container for the key "name".
     * Returns the same instance.
     *
     * @param name
     * @param instance
     */
    instance<T>(name: string, instance: T): T;
    /**
     * Check if the binding is allowed or not and throw an
     * exception if it is not allowed.
     *
     * @param name
     */
    protected validateBindingAllowed(name: string): void;
    /**
     * Determine if a binding is modifiable or not. Singleton bindings
     * should not be modifiable.
     *
     * @param name
     */
    protected isBindingModifiable(name: string): boolean;
    /**
     * Returns the laress binding of the specified key. Or returns null when
     * no binding is found or the defaultValue is not
     *
     * @param key The binding key to retreive
     * @param defaultValue The default value to return, if no bindings found
     */
    get<T>(key: string, defaultValue?: T | null): T | null;
}
