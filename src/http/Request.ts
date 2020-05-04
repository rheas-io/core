import { IncomingMessage } from "http";
import { IRequest } from "@laress/contracts";

export class Request extends IncomingMessage implements IRequest {

}
