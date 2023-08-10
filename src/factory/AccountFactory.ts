import { randomUUID } from "crypto";
import prisma from "../";
import { InviteFactory } from "./InviteFactory";
import { sign } from "jsonwebtoken";

interface AccountLoginResponse {
	jwt?: string;
	success: boolean;
}

export class AccountFactory {
	/**
	 * Create an account.
	 * @param username The username to create the account with
	 * @param password The (hashed) password to create the account with
	 * @param invite The invite to create the account with
	 * @returns Whether it successfully made an account or not
	 */
	async create(
		username: string,
		password: string,
		invite: string
	): Promise<boolean> {
		const uid = await this.getUID();

		const user = await prisma.user.create({
			data: {
				user: username,
				password: password,
				inviteList: [],
				images: [],
				uid: uid,
				uploadKey: `notorious${username.toLowerCase()}${randomUUID()}`,
				invited: [],
				ips: [],
				createdOn: new Date().valueOf(),
				invitedBy: invite,
			},
		});

		await new InviteFactory().delete(invite, {
			mark: true,
			user: user.uuid,
		});

		return true;
	}

	/**
	 * Get the next UID for a user. Mainly used for registration.
	 * @returns The next UID
	 */
	private async getUID(): Promise<number> {
		const count = await prisma.user.count();

		if (!count) return 1;

		return count + 1;
	}

	/**
	 * Login to an account.
	 * @param username The username for the account
	 * @returns The response (Refer to AccountLoginResponse, can have JWT if succcessful)
	 */
	async login(username: string): Promise<AccountLoginResponse> {
		const userSearch = await prisma.user.findFirst({
			where: {
				user: {
					equals: username,
					mode: "insensitive",
				},
			},
		});

		if (!userSearch) return { success: false };

		const jwtToken: string = sign(
			{ user: userSearch },
			process.env.JWT_SECRET!,
			{ expiresIn: "24h" }
		);

		await prisma.session.create({
			data: { token: jwtToken, createdBy: userSearch.uuid },
		});

		return { success: true, jwt: jwtToken };
	}
}
