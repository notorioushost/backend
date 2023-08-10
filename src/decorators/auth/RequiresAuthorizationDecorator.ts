import { FastifyReply, FastifyRequest } from "fastify";
import { IMiddleware } from "../../router/IMiddleware";

class RequiresAuthorizationMiddleware extends IMiddleware {
	async run(req: FastifyRequest, res: FastifyReply): Promise<boolean> {
		if (!req.headers.authorization) {
			res.status(403).send({
				success: false,
				errors: [
					{ error: "UNAUTHORIZED", message: "You are unauthorized." },
				],
			});
			return false;
		}

		return true;
	}
}

export function RequiresAuthorization<T extends { new (...args: any[]): {} }>(
	constructor: T
) {
	return class extends constructor {
		middlewares = [new RequiresAuthorizationMiddleware()];
	};
}
