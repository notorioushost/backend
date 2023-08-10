import { IValidator } from "../../IValidator";
import { verify } from "argon2";

interface PasswordValidatorBody {
	// The users password
	hashed_password: string;
	// The password put in
	password: string;
}

export class PasswordValidator extends IValidator {
	/**
	 * Validate a users password.
	 * @param obj The body. (Refer to PasswordValidatorBody)
	 * @returns True == Validation was successful, false == validation failed
	 */
	async verify(obj: PasswordValidatorBody): Promise<boolean> {
		const status = await verify(obj.hashed_password, obj.password);

		if (!status) return false;

		return true;
	}
}
