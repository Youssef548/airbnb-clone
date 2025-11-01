// app.js
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
dotenv.config();

import errorHandler from "./middleware/error.middleware";
import authRoutes from "./routes/authRoutes";
import bookingRoutes from "./routes/booking.route";
import favoriteRoutes from "./routes/favorite.route";
import listingRoutes from "./routes/listing.route";
import reviewRoutes from "./routes/review.route";
import logger, { stream } from "./utils/logger";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";

const app = express();

// Security: Helmet helps secure Express apps by setting HTTP response headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Security: CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? JSON.parse(process.env.ALLOWED_ORIGINS)
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (arg0: Error | null, arg1: boolean | undefined) => void
    ) => {
      // Allow requests with no origin (like mobile apps, Postman, or same-origin)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Check if the origin is in the allowedOrigins array
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`), false);
      }
    },
    credentials: true,
  })
);

const PORT = process.env.PORT || 3000;

// Security: Rate limiting to prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Security: Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/register requests per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all requests
app.use(limiter);

// Logging: HTTP request logging (only in development and production, not in tests)
if (process.env.NODE_ENV !== "test") {
  app.use(
    morgan(
      process.env.NODE_ENV === "production"
        ? "combined" // Apache-style combined format for production
        : "dev", // Colored, concise output for development
      { stream }
    )
  );
}

// Middleware setup
// Security: Request size limits to prevent DoS attacks
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Security: Sanitize data to prevent NoSQL injection attacks
app.use(mongoSanitize());

// Routes setup
app.get("/", (req, res) => res.send("Express on Vercel"));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     description: Returns the health status of the API
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 123.45
 *                 environment:
 *                   type: string
 *                   example: development
 *                 database:
 *                   type: string
 *                   example: connected
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    database: "connected", // Could add actual DB health check here
  });
});

// Swagger API documentation (only in development and production, not in tests)
if (process.env.NODE_ENV !== "test") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  logger.info("Swagger documentation available at /api-docs");
}

app.use("/api/auth/", authLimiter, authRoutes);
app.use("/api/listings/", listingRoutes);
app.use("/api/favorites/", favoriteRoutes);
app.use("/api/booking/", bookingRoutes);
app.use("/api/reviews/", reviewRoutes);

app.use(errorHandler);

export default app;
