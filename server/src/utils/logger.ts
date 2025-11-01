import winston from "winston";

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  if (stack) {
    return `${timestamp} [${level}]: ${message}\n${stack}`;
  }
  return `${timestamp} [${level}]: ${message}`;
});

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat
      ),
    }),
    // File transport for errors
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Handle uncaught exceptions and unhandled rejections
if (process.env.NODE_ENV !== "test") {
  logger.exceptions.handle(
    new winston.transports.File({ filename: "logs/exceptions.log" })
  );

  logger.rejections.handle(
    new winston.transports.File({ filename: "logs/rejections.log" })
  );
}

// Create a stream object for Morgan HTTP logger
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export default logger;
