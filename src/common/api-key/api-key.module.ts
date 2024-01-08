import { Global, Module } from "@nestjs/common";
import { ApiKeyXApiKeyStrategy } from "src/common/api-key/guards/x-api-key/api-key.x-api-key.strategy";
import { ApiKeyRepositoryModule } from "src/common/api-key/repository/api-key.repository.module";
import { ApiKeyService } from "./services/api-key.service";

@Global()
@Module({
  providers: [ApiKeyService, ApiKeyXApiKeyStrategy],
  exports: [ApiKeyService, ApiKeyRepositoryModule],
  controllers: [],
  imports: [ApiKeyRepositoryModule],
})
export class ApiKeyModule {}
