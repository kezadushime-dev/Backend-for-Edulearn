"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const AppError_1 = require("../utils/AppError");
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, {
        abortEarly: false,
        allowUnknown: false,
    });
    if (error) {
        const messages = error.details.map((d) => d.message);
        return next(new AppError_1.AppError(messages.join(", "), 400));
    }
    next();
};
exports.validate = validate;
