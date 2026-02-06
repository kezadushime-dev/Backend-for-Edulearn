import swaggerJsDoc from "swagger-jsdoc";

const options: swaggerJsDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "learning-platform-backend",
      version: "1.0.0",
      description:
        "Production-ready REST API for learning-platform with JWT, Multer, and Cloudinary",
    },
    servers: [
      {
        url: "http://localhost:8008/api/v1",
        description: "Development server",
      },
    //   { url: "https://project.onrender.com", description: "Production server" },
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
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsDoc(options);