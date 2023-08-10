import { IValidator } from "../../IValidator";
import prisma from "../../../";

export class UsernameValidator extends IValidator {
	/**
	 * Validate a username
	 * @param obj The username to validate
	 * @returns True == Validation was successful, false == validation failed
	 */
	async verify(obj: string): Promise<boolean> {
        const userSearch = await prisma.user.findFirst({
			where: {
				user: {
					equals: obj,
					mode: "insensitive",
				},
			},
		});

		if (userSearch)
			return false;
        
        return true;
    }
}
