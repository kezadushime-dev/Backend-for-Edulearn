"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const isProduction = process.env.NODE_ENV === "production";
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "learning-platform-backend",
            version: "1.0.0",
            description: "Production-ready REST API for learning-platform with JWT, Multer, and Cloudinary",
        },
        // ✅ Use correct base URL including /api/v1
        servers: isProduction
            ? [
                {
                    url: "https://backend-for-edulearn.onrender.com/api/v1",
                    description: "Production server",
                },
            ]
            : [
                {
                    url: "http://localhost:8002/api/v1",
                    description: "Development server",
                },
                {
                    url: "https://backend-for-edulearn.onrender.com/api/v1",
                    description: "Production server",
                },
            ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: ["./src/routes/*.ts"], // keep your JSDoc comments as-is
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
