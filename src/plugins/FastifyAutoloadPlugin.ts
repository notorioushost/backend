import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import IRouter, { Method } from "../router/IRouter";
import fg from "fast-glob";
import BaseRoute from "../router/impl/BaseRoute";
import { IMiddleware } from "../router/IMiddleware";

interface AutoloadPluginOptions {
	proxy?(req: FastifyRequest, res: FastifyReply, route: IRouter): void;
	prefix?: string;
}

export default async function (
	fastify: FastifyInstance,
	opts: AutoloadPluginOptions
) {
	const routes: string[] = await fg(
		`${__dirname.replace(/\\/g, "/")}/../router/impl/**/*{.ts,.js}`
	);

	routes.map(async (value: string) => {
		let { default: r } = await import(value);
		let route: IRouter = new r();

		if (!route) throw new Error(`error loading route ${value}`);

		// proxy func
		async function run(req: FastifyRequest, res: FastifyReply) {
			if (route.middlewares) {
				route.middlewares.forEach(async (middleware) => {
					const status = middleware.run(req, res);

					if (!status) return;
				});
			}

			if (opts.proxy !== undefined)
				return await opts.proxy(req, res, route);

			return await route.run(req, res);
		}

		// prefix
		if (opts.prefix) route.route = `${opts.prefix}${route.route}`;

		fastify.route({
			handler: run,
			method: route.method,
			url: route.route,
			schema: route.schema ? route.schema : null,
		});

		fastify.log.info({
			origin: "fastify-autoload-plugin",
			msg: `route ${route.route}:${route.method} was loaded.`,
		});
	});
}
