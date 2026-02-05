import helmet from "helmet";
import { Express } from "express";

export const applySecurityMiddleware = (app: Express) => {
  app.use(helmet());
};
