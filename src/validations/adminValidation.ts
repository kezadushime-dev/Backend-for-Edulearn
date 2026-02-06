import Joi from "joi";

export const updateRoleSchema = Joi.object({
  role: Joi.string()
    .valid("learner", "instructor", "admin")
    .required()
    .messages({
      "any.only": "Role must be learner, instructor or admin",
    }),
});


export const adminCreateUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),

  role: Joi.string()
    .valid("learner", "instructor", "admin")
    .required(),
});