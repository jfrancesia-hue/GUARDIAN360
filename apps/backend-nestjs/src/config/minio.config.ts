import { registerAs } from "@nestjs/config";

export const minioConfig = registerAs("minio", () => ({
  endpoint: process.env.MINIO_ENDPOINT ?? "localhost",
  port: Number(process.env.MINIO_PORT ?? 9000),
  rootUser: process.env.MINIO_ROOT_USER,
  rootPassword: process.env.MINIO_ROOT_PASSWORD,
  bucket: process.env.MINIO_BUCKET ?? "guardian360-dev"
}));
