import * as Joi from "joi";

export const JoiRegisterSchema = Joi.object().keys({
	username: Joi.string().min(2).required(),
	password: Joi.string().min(6).required(),
	invite: Joi.string().required(),
});
