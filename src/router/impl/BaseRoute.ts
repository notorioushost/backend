import IRouter, { Method } from "../IRouter";
import { FastifyReply, FastifyRequest } from "fastify";

export default class extends IRouter {
	constructor() {
		super("/", "GET");
	}

	async run(req: FastifyRequest, res: FastifyReply) {
		return res.status(200).send({ hi: true });
	}
}
