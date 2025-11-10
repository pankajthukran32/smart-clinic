import winston from "winston";
import path from "path";
import fs from "fs";

// ✅ Ensure 'logs' directory exists
const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// ✅ Define a consistent log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }), // capture stack traces
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
  })
);

// ✅ Create the logger instance
const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    // 🔹 Save all logs (info, warn, error)
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),

    // 🔹 Save only errors
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
  ],
});

// ✅ Add console transport (for development)
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // adds color
        winston.format.simple() // compact console format
      ),
    })
  );
}

// ✅ Handle uncaught exceptions & unhandled rejections
logger.exceptions.handle(
  new winston.transports.File({ filename: path.join(logDir, "exceptions.log") })
);
logger.rejections.handle(
  new winston.transports.File({ filename: path.join(logDir, "rejections.log") })
);

// ✅ Optional helper for console + file logging
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

export default logger;
