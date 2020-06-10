import { ServiceProvider } from "./serviceProvider";
import { IDeferredService } from "@rheas/contracts/services";

export class DeferredServiceProvider extends ServiceProvider implements IDeferredService {

    /**
     * The service will be created only if requested by this name.
     * 
     * @returns string
     */
    public provide(): string {
        return this.serviceName();
    }
}