import { KeyValue } from "@rheas/contracts";
import { ContainerInstance } from "./containerInstance";
import { IContainer, InstanceHandler, IContainerInstance } from "@rheas/contracts/container";

export class Container implements IContainer {

    /**
     * KeyValue mapping of container bindings.
     * 
     * @var object
     */
    protected _instances: KeyValue<IContainerInstance> = {};

    /**
     * Creates a singleton binding for the key with a resolver.
     * 
     * @param name 
     * @param resolver 
     */
    public singleton(name: string, resolver: InstanceHandler): IContainerInstance {
        return this.bind(name, resolver, true);
    }

    /**
     * Creates a binding for the key with a resolver. The resolver will be run only
     * when the binding is requested.
     * 
     * @param name 
     * @param resolver 
     * @param singleton 
     */
    public bind(name: string, resolver: InstanceHandler, singleton: boolean = false): IContainerInstance {
        return this.createInstance(name, () => {
            return ContainerInstance.createFromResolver(this, resolver, singleton);
        });
    }

    /**
     * Creates a binding for the key with an object. The passed in object will be returned
     * when the binding is requested.
     * 
     * @param name 
     * @param instance 
     * @param singleton 
     */
    public instance(name: string, instance: any, singleton: boolean = false): IContainerInstance {
        return this.createInstance(name, () => {
            return ContainerInstance.createFromInstance(this, instance, singleton);
        });
    }

    /**
     * Creates a container instance and adds it to the binding list only if
     * a binding does not exists or it is not singleton.
     * 
     * @param name 
     * @param callback 
     */
    protected createInstance(name: string, callback: () => IContainerInstance) {
        let instance: IContainerInstance = this._instances[name];

        if (instance === undefined || !instance.isSingleton()) {
            instance = callback();
        }
        return this._instances[name] = instance;
    }

    /**
     * Returns the rheas binding of the specified key. Or returns null when
     * no binding is found or the defaultValue is not
     * 
     * @param key The binding key to retreive
     */
    public get(key: string, defaultValue: any = null) {

        if (!this._instances.hasOwnProperty(key)) {
            return defaultValue;
        }
        return this._instances[key].getResolved();
    }
}