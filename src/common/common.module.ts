import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import Joi from "joi";
import { APP_LANGUAGE } from "src/app/constants/app.constant";
import { ENUM_APP_ENVIRONMENT } from "src/app/constants/app.enum.constant";
import configs from "src/configs";
import { ENUM_MESSAGE_LANGUAGE } from "./message/constants/message.enum.constant";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseOptionsService } from "./database/services/database.options.service";
import { DataSource, DataSourceOptions } from "typeorm";
import { RequestModule } from "./request/request.module";
import { HelperModule } from "./helper/helper.module";
import { ErrorModule } from "./error/error.module";
import { MessageModule } from "./message/message.module";
import { ResponseModule } from "./response/response.module";
import { PaginationModule } from "./pagination/pagination.module";
import { SettingModule } from "./setting/setting.module";
import { DebuggerModule } from "./debugger/debugger.module";
import { ApiKeyModule } from "./api-key/api-key.module";
import { AuthModule } from "./auth/auth.module";
import { LoggerModule } from "./logger/logger.module";
import { PolicyModule } from "./policy/policy.module";

@Module({
  controllers: [],
  providers: [],
  imports: [
    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,
      cache: true,
      envFilePath: [".env"],
      expandVariables: true,
      validationSchema: Joi.object({
        APP_NAME: Joi.string().required(),
        APP_ENV: Joi.string()
          .valid(...Object.values(ENUM_APP_ENVIRONMENT))
          .default("development")
          .required(),
        APP_LANGUAGE: Joi.string()
          .valid(...Object.values(ENUM_MESSAGE_LANGUAGE))
          .default(APP_LANGUAGE)
          .required(),

        HTTP_ENABLE: Joi.boolean().default(true).required(),
        HTTP_HOST: [
          Joi.string().ip({ version: "ipv4" }).required(),
          Joi.valid("localhost").required(),
        ],
        HTTP_PORT: Joi.number().required(),
        HTTP_VERSIONING_ENABLE: Joi.boolean().default(true).required(),
        HTTP_VERSION: Joi.number().required(),
        DATABASE_TYPE: Joi.string().required(),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_TZ: Joi.string().required(),
        DATABASE_PORT: Joi.string().required(),
        DATABASE_SYNCHRONIZE: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_USER: Joi.string().allow(null, "").optional(),
        DATABASE_PASSWORD: Joi.string().optional(),
        AUTH_JWT_SUBJECT: Joi.string().required(),
        AUTH_JWT_AUDIENCE: Joi.string().required(),
        AUTH_JWT_ISSUER: Joi.string().required(),
        AUTH_JWT_PAYLOAD_ENCRYPT: Joi.boolean().default(false).required(),
        AUTH_JWT_ACCESS_TOKEN_SECRET_KEY: Joi.string().alphanum().min(5).max(50).required(),
        AUTH_JWT_ACCESS_TOKEN_EXPIRED: Joi.string().default("15m").required(),
        AUTH_JWT_PAYLOAD_ACCESS_TOKEN_ENCRYPT_KEY: Joi.string()
          .allow(null, "")
          .min(20)
          .max(50)
          .optional(),
        AUTH_JWT_PAYLOAD_ACCESS_TOKEN_ENCRYPT_IV: Joi.string()
          .allow(null, "")
          .min(16)
          .max(50)
          .optional(),
        AUTH_JWT_REFRESH_TOKEN_SECRET_KEY: Joi.string().alphanum().min(5).max(50).required(),
        AUTH_JWT_REFRESH_TOKEN_EXPIRED: Joi.string().default("7d").required(),
        AUTH_JWT_PAYLOAD_REFRESH_TOKEN_ENCRYPT_KEY: Joi.string()
          .allow(null, "")
          .min(20)
          .max(50)
          .optional(),
        AUTH_JWT_PAYLOAD_REFRESH_TOKEN_ENCRYPT_IV: Joi.string()
          .allow(null, "")
          .min(16)
          .max(50)
          .optional(),
        DEBUGGER_HTTP_WRITE_INTO_FILE: Joi.boolean().default(false).required(),
        DEBUGGER_HTTP_WRITE_INTO_CONSOLE: Joi.boolean().default(false).required(),
        DEBUGGER_SYSTEM_WRITE_INTO_FILE: Joi.boolean().default(false).required(),
        DEBUGGER_SYSTEM_WRITE_INTO_CONSOLE: Joi.boolean().default(false).required(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseOptionsService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    MessageModule,
    HelperModule,
    RequestModule,
    ResponseModule,
    ErrorModule,
    LoggerModule,
    ApiKeyModule,
    PaginationModule,
    AuthModule.forRoot(),
    SettingModule,
    PolicyModule,
    DebuggerModule.forRoot(),
  ],
})
export class CommonModule {}
