import { KeyValue } from "@rheas/contracts";
import { IContainer, InstanceHandler, IContainerInstance } from "@rheas/contracts/container";
export declare class Container implements IContainer {
    /**
     * KeyValue mapping of container bindings.
     *
     * @var object
     */
    protected _instances: KeyValue<IContainerInstance>;
    /**
     * Creates a singleton binding for the key with a resolver.
     *
     * @param name
     * @param resolver
     */
    singleton(name: string, resolver: InstanceHandler): IContainerInstance;
    /**
     * Creates a binding for the key with a resolver. The resolver will be run only
     * when the binding is requested.
     *
     * @param name
     * @param resolver
     * @param singleton
     */
    bind(name: string, resolver: InstanceHandler, singleton?: boolean): IContainerInstance;
    /**
     * Creates a binding for the key with an object. The passed in object will be returned
     * when the binding is requested.
     *
     * @param name
     * @param instance
     * @param singleton
     */
    instance(name: string, instance: any, singleton?: boolean): IContainerInstance;
    /**
     * Creates a container instance and adds it to the binding list only if
     * a binding does not exists or it is not singleton.
     *
     * @param name
     * @param callback
     */
    protected createInstance(name: string, callback: () => IContainerInstance): IContainerInstance;
    /**
     * Returns the rheas binding of the specified key. Or returns null when
     * no binding is found or the defaultValue is not
     *
     * @param key The binding key to retreive
     */
    get(key: string, defaultValue?: any): any;
}
