import { KeyValue } from "@laress/contracts";
import { InstanceHandler, IContainer } from "@laress/contracts/core";

interface IBinding {
    type: BindingType,
    instance: any,
}

enum BindingType {
    SINGLETON = 1, OTHER = 2
}

/**
 * Laress container stores app specific singleton instances
 * and other service provider bindings. There may be instances
 * where we need to access certain objects from framework 
 * methods and as well as implementing application methods. This
 * container facilitates storage of such instances.
 */
export class Container implements IContainer {

    /**
     * Singleton instance of the laress application
     * 
     * @var IContainer
     */
    private static _instance: IContainer | null = null;

    /**
     * Holds all the laress app bindings. Inorder to avoid polluting
     * this objects properties, we will be using the bindings object
     * for storing the bindings
     */
    private bindings: KeyValue<IBinding> = {};

    /**
     * Creates a singleton instance of the application if it does not
     * exist and returns it.
     * 
     * @returns IContainer
     */
    public static instance(): IContainer {

        if (Container._instance === null) {
            Container._instance = new Container();
        }
        return Container._instance;
    }

    /**
     * Sets the global container instance
     * 
     * @param container 
     */
    public static setInstance(container: IContainer) {
        Container._instance = container;
    }

    /**
     * Binds a singleton class to this container.
     * 
     * @param name Container binding key
     * @param callback The value returned by this callback will be bound to the key
     */
    public singleton<T>(name: string, callback: InstanceHandler<T>): T {

        this.validateBindingAllowed(name);

        let resultInstance = callback(this);

        this.bindings[name] = {
            type: BindingType.SINGLETON,
            instance: resultInstance
        };
        return resultInstance;
    }

    /**
     * Binds an instance to the container for the key "name".
     * Returns the same instance.
     * 
     * @param name 
     * @param instance 
     */
    public instance<T>(name: string, instance: T): T {

        this.validateBindingAllowed(name);

        this.bindings[name] = { type: BindingType.OTHER, instance: instance };

        return instance;
    }

    /**
     * Check if the binding is allowed or not and throw an
     * exception if it is not allowed.
     * 
     * @param name 
     */
    protected validateBindingAllowed(name: string) {
        if (!this.isBindingModifiable(name)) {
            throw new Error("A singleton binding already exists for the key " + name);
        }
    }

    /**
     * Determine if a binding is modifiable or not. Singleton bindings
     * should not be modifiable.
     * 
     * @param name 
     */
    protected isBindingModifiable(name: string): boolean {

        if (!this.bindings.hasOwnProperty(name)) {
            return true;
        }
        let binding = this.bindings[name];

        return BindingType.SINGLETON !== binding.type;
    }

    /**
     * Returns the laress binding of the specified key. Or returns null when
     * no binding is found or the defaultValue is not
     * 
     * @param key The binding key to retreive
     * @param defaultValue The default value to return, if no bindings found
     */
    public get<T = any>(key: string, defaultValue: T | null = null): T | null {

        if (!this.bindings.hasOwnProperty(key)) {
            return defaultValue === undefined ? null : defaultValue;
        }
        return this.bindings[key].instance;
    }

}