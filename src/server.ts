import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import logger from "./config/logger";

const startServer = async () => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
  });

  process.on("SIGINT", () => {
    logger.info("Gracefully shutting down");
    server.close(() => process.exit(0));
  });
  process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  });

  process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
  });
};

startServer();