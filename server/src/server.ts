import app from "./app";
import connectDB from "./config/database";
import logger from "./utils/logger";
import mongoose from "mongoose";

const PORT = process.env.PORT || 3000;

let server: any;

connectDB().then(() => {
  server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
});

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  if (server) {
    server.close(async () => {
      logger.info("HTTP server closed.");

      try {
        // Close database connection
        await mongoose.connection.close();
        logger.info("MongoDB connection closed.");

        logger.info("Graceful shutdown completed.");
        process.exit(0);
      } catch (error) {
        logger.error(`Error during shutdown: ${error}`);
        process.exit(1);
      }
    });

    // Force shutdown if graceful shutdown takes too long
    setTimeout(() => {
      logger.error("Forcefully shutting down after timeout.");
      process.exit(1);
    }, 10000); // 10 seconds timeout
  } else {
    process.exit(0);
  }
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.message}`, error);
  gracefulShutdown("uncaughtException");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  gracefulShutdown("unhandledRejection");
});
