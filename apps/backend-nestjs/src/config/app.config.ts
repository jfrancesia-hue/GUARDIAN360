import { registerAs } from "@nestjs/config";

export const appConfig = registerAs("app", () => ({
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.API_PORT ?? 3001),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  logLevel: process.env.LOG_LEVEL ?? "info"
}));
