import path from 'path';
import { FileManager } from '@rheas/files';
import { IRouter } from '@rheas/contracts/routes';
import { IApp, IKernal } from '@rheas/contracts/core';
import { IFileManager } from '@rheas/contracts/files';
import { IRequest, IResponse } from '@rheas/contracts';
import { RequestPipeline } from '@rheas/routing/requestPipeline';
import { IMiddlewareManager } from '@rheas/contracts/middlewares';
import { IException, IExceptionHandler } from '@rheas/contracts/errors';

export class Kernal implements IKernal {
    /**
     * Application instance.
     *
     * @var IApp
     */
    protected _app: IApp;

    /**
     * Applications middleware manager.
     *
     * @var IMiddlewareManager
     */
    protected _middlewares: IMiddlewareManager;

    /**
     * File manager instance.
     *
     * @var IFileManager
     */
    protected _fileManager: IFileManager;

    /**
     * Creates a new application kernal, that serves static contents and
     * routes request through the router after executing all global middlewares.
     *
     * @param app
     * @param middlewares
     */
    constructor(app: IApp, middlewares: IMiddlewareManager) {
        this._app = app;
        this._middlewares = middlewares;

        this._fileManager = new FileManager();
    }

    /**
     * Application requests are send here for processing. The request is initially
     * sent to a pipeline of global middlewares (middlewares of this class). Once that's
     * done, they are forwarded to routeHandler, which checks for a matching route. If found
     * one, then the request is send through a pipeline of route middlewares.
     *
     * @param request
     * @param response
     */
    public async handle(request: IRequest, response: IResponse): Promise<IResponse> {
        try {
            const servedFile = await this.serveFile(request, response);

            // Sends request through the middlewares of this class, which are
            // global middlewares. Final destination will be the router handle function
            // which will continue the request flow through the route middleware pipeline,
            // if a matching route is found, or an exception will be thrown.
            if (!servedFile) {
                const router: IRouter = this._app.get('router');

                return await new RequestPipeline()
                    .through(this._middlewares.globalMiddlewares())
                    .sendTo(router.handle.bind(router), request, response);
            }
        } catch (err) {
            // Catch any exception occured when processing the request and
            // create a response from the exception. This error response should
            // be returned.
            response = this.responseFromError(err, request, response);
        }
        return response;
    }

    /**
     * Tries to send a static file for the given request. If a static file exists,
     * we will send it, otherwise we will return a false.
     *
     * @param request
     * @param response
     */
    public async serveFile(request: IRequest, response: IResponse): Promise<IResponse | false> {
        const staticFilePath = await this.staticFileExistsForRequest(request);

        if (staticFilePath) {
            const mimeType = request.contents().getMimeType(staticFilePath);

            if (mimeType) {
                request.contents().setFormat(mimeType);
            }
            return response.setContent(await this._fileManager.readFile(staticFilePath));
        }
        return false;
    }

    /**
     * Checks the application assets folder to see if any static file exists for
     * the given request. If one exists, the file path is returned or `false` is
     * returned.
     *
     * @param request
     */
    public async staticFileExistsForRequest(request: IRequest): Promise<string | false> {
        const assetFolder = this._app.path('assets');

        const filePath = path.resolve(assetFolder, request.getPath());

        if (await this._fileManager.fileExists(filePath)) {
            return filePath;
        }
        return false;
    }

    /**
     * Handles the exceptions. Converts the exception trace and message into a JSON format
     * that is suitable for sending and/or creates a response contet from the exception.
     * Also logs the exception if it has to be logged.
     *
     * @param err
     * @param req
     * @param res
     */
    public responseFromError(err: Error | IException, req: IRequest, res: IResponse): IResponse {
        const exceptionHandler: IExceptionHandler = this._app.get('error');

        if (exceptionHandler) {
            err = exceptionHandler.prepareException(err);

            exceptionHandler.report(err);

            res = exceptionHandler.responseFromError(err, req, res);
        }
        return res;
    }
}
