import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApiKeyEntity } from "./entities/api-key.entity";
import { ApiKeyRepository } from "./repositories/api-key.repository";

@Module({
  providers: [ApiKeyRepository],
  exports: [ApiKeyRepository],
  controllers: [],
  imports: [TypeOrmModule.forFeature([ApiKeyEntity])],
})
export class ApiKeyRepositoryModule {}
