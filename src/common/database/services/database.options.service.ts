import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

@Injectable()
export class DatabaseOptionsService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: this.configService.get("database.type", { infer: true }),
      host: this.configService.get("database.host", { infer: true }),
      port: this.configService.get("database.port", { infer: true }),
      username: this.configService.get("database.user", { infer: true }),
      password: this.configService.get("database.password", { infer: true }),
      database: this.configService.get("database.name", { infer: true }),
      synchronize: this.configService.get("database.synchronize", {
        infer: true,
      }),
      dropSchema: false,
      keepConnectionAlive: true,
      logging: this.configService.get("database.logging", { infer: true }),
      entities: [__dirname + "../../../../**/*.entity{.ts,.js}"],
    } as TypeOrmModuleOptions;
  }
}
