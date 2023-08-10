import { IValidator } from "../../IValidator";
import prisma from "../../../";

export class InviteValidator extends IValidator {
	/**
	 * Validate an invite
	 * @param obj The invite to validate
	 * @returns True == Validation was successful, false == validation failed
	 */
	async verify(obj: string): Promise<boolean> {
		const inviteSearch = await prisma.invite.findFirst({
			where: {
				code: {
					equals: obj,
					mode: "insensitive",
				},
			},
		});

		if (inviteSearch == null) return false;

		if (inviteSearch.used) return false;

		return true;
	}
}
