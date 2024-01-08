import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoggerEntity } from "./entities/logger.entity";
import { LoggerRepository } from "./repositories/logger.repository";

@Module({
  providers: [LoggerRepository],
  exports: [LoggerRepository],
  controllers: [],
  imports: [TypeOrmModule.forFeature([LoggerEntity])],
})
export class LoggerRepositoryModule {}
