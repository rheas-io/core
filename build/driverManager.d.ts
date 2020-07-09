import { KeyValue } from "@rheas/contracts";
import { IDriverManager } from "@rheas/contracts/core";
export declare class DriverManager<T> implements IDriverManager<T> {
    /**
     * Stores the manager driver instances.
     *
     * @var object
     */
    protected drivers: KeyValue<T>;
    /**
     * Registers a driver instance to the given name. If force is false
     * and an instance already exists for the key, then it won't be replaced.
     *
     * @param name
     * @param driver
     * @param force
     */
    registerDriver(name: string, driver: T, force: boolean): void;
    /**
     * Returns the driver instance for the name.
     *
     * @param name
     */
    getDriver(name: string): T;
}
