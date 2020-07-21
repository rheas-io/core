"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redirector_1 = require("./redirector");
const services_1 = require("@rheas/services");
class RedirectServiceProvider extends services_1.DeferredServiceProvider {
    /**
     * As this is a deferred service, redirector will be registerd only
     * when the service is requested.
     */
    register() {
        this.container.singleton(this.name, (request) => {
            const app = request.get('app');
            const urlGenerator = app.get('url');
            return new redirector_1.Redirector(urlGenerator, request, request.get('response'));
        });
    }
}
exports.RedirectServiceProvider = RedirectServiceProvider;
