import { StringObject } from '@rheas/contracts';
import { IRequestComponent } from '@rheas/contracts/routes/uri';
import { IRequestParams } from '@rheas/contracts/core/requestParams';

export class RequestParams extends Map<string, string> implements IRequestParams {
    /**
     * Keeps track of parameterized uri components. This class facilitates
     * getting the parameters as key-value pairs and/or just values as used
     * in frameworks like Laravel.
     *
     * @param components
     */
    constructor(components: IRequestComponent[] = []) {
        super();

        this.setParameters(components);
    }

    /**
     * Clears the existing parameter list and sets a new one from the
     * request uri components.
     *
     * @param components
     */
    public setParameters(components: IRequestComponent[]) {
        this.clear();

        components.forEach((component) => {
            const paramName = component.getParamName();

            if (paramName !== null) {
                this.set(paramName, component.getParam());
            }
        });
    }

    /**
     * Returns the parameter as a javascript object with the parameter name
     * as key associated with its value.
     *
     * @returns StringObject
     */
    public getStringObject(): StringObject {
        const result: StringObject = {};

        this.forEach((value, key) => {
            result[key] = value;
        });

        return result;
    }
}
