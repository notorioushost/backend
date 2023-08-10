import { fastify, FastifyInstance } from "fastify";
import { config } from "dotenv";
import HostConfig, { HostEnvironment } from "./config";

import { PrismaClient } from "@prisma/client";

config();

if (HostConfig.Environment == HostEnvironment.DEVELOPMENT) {
	process.env.DATABASE = process.env.DEV_DATABASE;
	process.env.JWT_SECRET = process.env.DEV_JWT_SECRET;
}

const app: FastifyInstance = fastify({ logger: true });
const prisma: PrismaClient = new PrismaClient();

app.register(import("./plugins/FastifyAutoloadPlugin"));
prisma.$connect();

app.listen({ port: parseInt(process.env.PORT!) });

export default prisma;
