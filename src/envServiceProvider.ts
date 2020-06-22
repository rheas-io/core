import { Env } from "./env";
import { ServiceProvider } from "./serviceProvider";

export class EnvServiceProvider extends ServiceProvider {

    /**
     * Registers the .env file reader service. 
     * 
     * The service will be responsible for creating, updating 
     * any environment variables. Also has a function to remove
     * the cached variable, so that environment var updates can
     * be synced.
     */
    public register() {
        this.container.singleton(this.name, app => {
            return new Env(app.get('path.root'), app.get('files'));
        });
    }
}