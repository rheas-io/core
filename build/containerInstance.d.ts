import { IContainerInstance, IContainer, InstanceHandler } from "@rheas/contracts/container";
export declare class ContainerInstance implements IContainerInstance {
    /**
     * The parent container. Required to resolve the callback/resolver function.
     * Passed as argument to the callback.
     *
     * @var IContainer
     */
    private _container;
    /**
     * Flag to determine if this instance is modifiable or not.
     *
     * @var boolean
     */
    private _singleton;
    /**
     * The service resolver callback function.
     *
     * @var InstanceHandler
     */
    private _resolver;
    /**
     * The resolved value. Either the result of the resolver or the instance
     * value itself.
     *
     * @var any
     */
    private _resolved;
    /**
     * Creates a container instance. The constructor is private and new instance
     * has to be created using the static functions so that necessary parameters
     * are loaded during object creation.
     *
     * @param container
     */
    private constructor();
    /**
     * Creates an empty instance with no instance/resolver.
     *
     * @param container
     */
    static createEmpty(container: IContainer): ContainerInstance;
    /**
     * Creates an instance from an object. There is nothing to resolve in
     * this container instance. The passed instance value is the resolved value.
     *
     * @param container
     * @param instance
     * @param singleton
     */
    static createFromInstance(container: IContainer, instance: any, singleton?: boolean): IContainerInstance;
    /**
     * Creates an instance from resolver callback function.
     *
     * @param container
     * @param resolver
     * @param singleton
     */
    static createFromResolver(container: IContainer, resolver: any, singleton?: boolean): IContainerInstance;
    /**
     * @inheritdoc
     *
     * @return
     */
    resolve(): any;
    /**
     * @inheritdoc
     */
    unresolve(): void;
    /**
     * @inheritdoc
     *
     * @param resolver
     */
    setResolver(resolver: InstanceHandler): IContainerInstance;
    /**
     * @inheritdoc
     *
     * @param instance
     */
    setInstance(instance: any): IContainerInstance;
    /**
     * @inheritdoc
     *
     * @param status
     */
    setSingleton(status: boolean): IContainerInstance;
    /**
     * @inheritdoc
     *
     * @return
     */
    isSingleton(): boolean;
    /**
     * @inheritdoc
     *
     * @return
     */
    getResolved(): any;
}
