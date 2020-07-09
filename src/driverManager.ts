import { KeyValue } from "@rheas/contracts";
import { IDriverManager } from "@rheas/contracts/core";
import { InvalidArgumentException } from "@rheas/errors/invalidArgument";

export class DriverManager<T> implements IDriverManager<T>{

    /**
     * Stores the manager driver instances.
     * 
     * @var object
     */
    protected drivers: KeyValue<T> = {};

    /**
     * Registers a driver instance to the given name. If force is false
     * and an instance already exists for the key, then it won't be replaced.
     * 
     * @param name 
     * @param driver 
     * @param force 
     */
    public registerDriver(name: string, driver: T, force: boolean): void {
        if (force || !this.drivers[name]) {
            this.drivers[name] = driver;
        }
    }

    /**
     * Returns the driver instance for the name.
     * 
     * @param name 
     */
    public getDriver(name: string): T {
        const driverInstance = this.drivers[name];

        if (!driverInstance) {
            throw new InvalidArgumentException(`Driver ${name} is not registered.`);
        }
        return driverInstance;
    }
}