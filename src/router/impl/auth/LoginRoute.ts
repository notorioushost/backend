import IRouter from "../../IRouter";
import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../..";
import { UsernameValidator } from "../../../validation/auth/register/UsernameValidator";
import { AccountFactory } from "../../../factory/AccountFactory";
import { PasswordValidator } from "../../../validation/auth/login/PasswordValidator";

interface LoginInterface {
	username: string;
	password: string;
}

export default class LoginRoute extends IRouter {
	constructor() {
		super("/auth/login", "POST", {
			body: {
				type: "object",
				properties: {
					username: { type: "string" },
					password: { type: "string" },
				},
				required: ["username", "password"],
			},
		});
	}

	async run(req: FastifyRequest, res: FastifyReply) {
		const body = req.body as LoginInterface;

		/* this returns false if the user exists, so i'm checking if it's true */
		const usernameStatus = await new UsernameValidator().verify(
			body.username
		);

		if (usernameStatus) {
			return res.status(403).send({
				success: false,
				errors: [
					{
						error: "VALIDATION_ERROR",
						message: "Username or password is incorrect.",
					},
				],
			});
		}

		const user = await prisma.user.findFirst({
			where: {
				user: {
					equals: body.username,
					mode: "insensitive",
				},
			},
		});

		const passwordStatus = await new PasswordValidator().verify({
			hashed_password: user!.password,
			password: body.password,
		});

		if (!passwordStatus) {
			return res.status(403).send({
				success: false,
				errors: [
					{
						error: "VALIDATION_ERROR",
						message: "Username or password is incorrect.",
					},
				],
			});
		}

		if (user!.blacklisted) {
			return res.status(403).send({
				success: false,
				errors: [
					{
						error: "USER_BLACKLISTED",
						message: `Your account has been blacklisted for ${
							user!.blacklistReason
						}`,
					},
				],
			});
		}

		const response = await new AccountFactory().login(user!.user);

		if (!response.success) {
			return res.status(403).send({
				success: false,
				errors: [
					{
						error: "FAILED_TO_LOGIN",
						message: "Error logging into your account.",
					},
				],
			});
		}

		return res.status(200).send({
			success: true,
			jwt: response.jwt!,
		});
	}
}
