import IRouter, { Method } from "../../IRouter";
import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../..";
import { JoiRegisterSchema } from "../../../joi/auth/JoiRegisterSchema";
import { hash } from "argon2";
import { InviteValidator } from "../../../validation/auth/register/InviteValidator";
import { UsernameValidator } from "../../../validation/auth/register/UsernameValidator";
import { AccountFactory } from "../../../factory/AccountFactory";
import { RequiresAuthorization } from "../../../decorators/auth/RequiresAuthorizationDecorator";

interface RegisterInterface {
	username: string;
	password: string;
	invite: string;
}

export default class RegisterRoute extends IRouter {
	constructor() {
		super("/auth/register", "POST", {
			body: {
				type: "object",
				properties: {
					username: { type: "string" },
					password: { type: "string" },
					invite: { type: "string" },
				},
				required: ["username", "password", "invite"],
			},
		});
	}

	async run(req: FastifyRequest, res: FastifyReply) {
		const body = req.body as RegisterInterface;

		const result = JoiRegisterSchema.validate(body);

		if (result.error) {
			return res.status(400).send({
				success: false,
				errors: [
					{
						error: "JOI_VALIDATION_ERROR",
						message: result.error.message,
					},
				],
			});
		}

		const inviteResult = await new InviteValidator().verify(body.invite);

		if (!inviteResult) {
			return res.status(400).send({
				success: false,
				errors: [
					{
						error: "INVITE_VALIDATION_ERROR",
						message: "Invite already used/doesn't exist.",
					},
				],
			});
		}

		// search for already existing username
		const usernameResult = await new UsernameValidator().verify(
			body.username
		);

		if (!usernameResult) {
			return res.status(400).send({
				success: false,
				errors: [
					{
						error: "USERNAME_VALIDATION_ERROR",
						message: "Username already exists.",
					},
				],
			});
		}

		const password = await hash(body.password);

		const status = await new AccountFactory().create(
			body.username,
			password,
			body.invite
		);

		if (status) {
			return res.status(200).send({
				success: true,
				response: "Successfully made account. Please login.",
			});
		} else {
			return res.status(400).send({
				success: false,
				errors: [
					{
						error: "ACCOUNT_CREATION_ERROR",
						message:
							"An error occurred while creating your account.",
					},
				],
			});
		}
	}
}
