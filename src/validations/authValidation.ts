import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Please provide valid email",
    }),

  password: Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]"))
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
      "Password must contain letters and numbers",
    }),

  role: Joi.string().valid("user", "leader", "learner", "instructor").optional(),
  avatarUrl: Joi.string().uri().optional(),
  country: Joi.string().allow("").optional(),
  field: Joi.string().allow("").optional(),
  province: Joi.string().allow("").optional(),
  church: Joi.string().allow("").optional(),
  club: Joi.string().allow("").optional(),
  region: Joi.string().allow("").optional(),
  district: Joi.string().allow("").optional(),
  conference: Joi.string().allow("").optional(),
  ageGroup: Joi.string().allow("").optional(),
});


export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});


export const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});
