import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Airbnb Clone API",
      version: "1.0.0",
      description:
        "A comprehensive RESTful API for an Airbnb clone application with authentication, listings, bookings, and favorites functionality.",
      contact: {
        name: "API Support",
        email: "support@airbnb-clone.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://your-production-url.vercel.app",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            username: { type: "string", example: "johndoe" },
            email: { type: "string", example: "john@example.com" },
            image: { type: "string", example: "https://example.com/avatar.jpg" },
            role: { type: "string", enum: ["guest", "host"], example: "guest" },
            emailVerified: { type: "boolean", example: false },
            favoriteListingsIds: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
        Listing: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string", example: "Beautiful Beach House" },
            description: {
              type: "string",
              example: "A stunning beach house with ocean views",
            },
            imageSrc: { type: "string" },
            category: { type: "string", example: "Beach" },
            roomCount: { type: "number", example: 3 },
            bathRoomCount: { type: "number", example: 2 },
            guestCount: { type: "number", example: 6 },
            location: {
              type: "object",
              properties: {
                flag: { type: "string" },
                label: { type: "string" },
                latlng: { type: "array", items: { type: "number" } },
                region: { type: "string" },
                value: { type: "string" },
              },
            },
            price: { type: "number", example: 150 },
            user: { type: "string", example: "507f1f77bcf86cd799439011" },
          },
        },
        Booking: {
          type: "object",
          properties: {
            _id: { type: "string" },
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time" },
            totalPrice: { type: "number", example: 450 },
            guest: { type: "string" },
            listingId: { type: "string" },
            authorId: { type: "string" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string", example: "Error message" },
            statusCode: { type: "number", example: 400 },
          },
        },
      },
    },
    tags: [
      {
        name: "Health",
        description: "Health check endpoints",
      },
      {
        name: "Authentication",
        description: "User authentication and authorization",
      },
      {
        name: "Listings",
        description: "Property listings management",
      },
      {
        name: "Bookings",
        description: "Booking/reservation management",
      },
      {
        name: "Favorites",
        description: "User favorites management",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/app.ts"], // Path to API route files
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
