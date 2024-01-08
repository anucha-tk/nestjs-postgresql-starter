import { registerAs } from "@nestjs/config";

export default registerAs(
  "database",
  (): Record<string, any> => ({
    url: process.env.DATABASE_URL,
    type: process.env.DATABASE_TYPE,
    host: process.env?.DATABASE_HOST,
    port: process.env?.DATABASE_PORT || "5432",
    name: process.env?.DATABASE_NAME,
    user: process.env?.DATABASE_USER,
    password: process?.env.DATABASE_USER_PWD,
    logging: process?.env.DATABASE_LOGGING || false,
    synchronize: process.env.DATABASE_SYNCHRONIZE === "true",
  }),
);
