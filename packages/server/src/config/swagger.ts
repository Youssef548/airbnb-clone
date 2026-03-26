import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Airbnb Clone API",
      version: "1.0.0",
      description:
        "Full-stack Airbnb clone REST API built with Express, MongoDB, and TypeScript",
    },
    servers: [
      {
        url: "/api",
        description: "API server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
        Location: {
          type: "object",
          properties: {
            flag: { type: "string" },
            label: { type: "string" },
            latlng: { type: "array", items: { type: "number" } },
            region: { type: "string" },
            value: { type: "string" },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            username: { type: "string" },
            email: { type: "string" },
            image: { type: "string" },
            role: { type: "string", enum: ["guest", "host"] },
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
            title: { type: "string" },
            description: { type: "string" },
            imageSrc: { type: "string" },
            category: { type: "string" },
            roomCount: { type: "number" },
            bathRoomCount: { type: "number" },
            guestCount: { type: "number" },
            price: { type: "number" },
            location: { $ref: "#/components/schemas/Location" },
            averageRating: { type: "number" },
            reviewCount: { type: "number" },
            user: { $ref: "#/components/schemas/User" },
          },
        },
        Booking: {
          type: "object",
          properties: {
            _id: { type: "string" },
            startDate: { type: "string", format: "date" },
            endDate: { type: "string", format: "date" },
            totalPrice: { type: "number" },
            guest: { type: "string" },
            listingId: { type: "string" },
            authorId: { type: "string" },
          },
        },
        Review: {
          type: "object",
          properties: {
            _id: { type: "string" },
            listing: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
            rating: { type: "number", minimum: 1, maximum: 5 },
            comment: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            currentPage: { type: "number" },
            totalPages: { type: "number" },
            totalCount: { type: "number" },
            limit: { type: "number" },
            hasNextPage: { type: "boolean" },
            hasPreviousPage: { type: "boolean" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
