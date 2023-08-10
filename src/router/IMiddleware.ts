import { FastifyReply, FastifyRequest } from "fastify";

export abstract class IMiddleware {
	abstract run(
		req: FastifyRequest,
		res: FastifyReply
	): boolean | Promise<boolean>;
}
