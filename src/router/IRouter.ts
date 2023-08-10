import { FastifyReply, FastifyRequest } from "fastify";
import { IMiddleware } from "./IMiddleware";

export type Method = "GET" | "POST" | "DELETE";

export default abstract class IRouter {
	route: string;
	method: Method;
	schema?: any;
	middlewares?: IMiddleware[];

	constructor(route: string, method: Method, schema?: any) {
		this.route = route;
		this.method = method;
		this.schema = schema;
	}

	abstract run(req: FastifyRequest, res: FastifyReply): any;
}
