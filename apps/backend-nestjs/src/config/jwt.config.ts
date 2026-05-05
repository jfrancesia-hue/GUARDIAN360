import { registerAs } from "@nestjs/config";

const isProduction = process.env.NODE_ENV === "production";

export const jwtConfig = registerAs("jwt", () => ({
  secret:
    process.env.JWT_SECRET ??
    (isProduction ? undefined : "guardian360_local_access_secret_min_32_chars"),
  expiresIn: process.env.JWT_EXPIRES_IN ?? "15m",
  refreshSecret:
    process.env.JWT_REFRESH_SECRET ??
    (isProduction ? undefined : "guardian360_local_refresh_secret_min_32_chars"),
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d"
}));
