import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DatabasePostgresIDRepositoryAbstract } from "src/common/database/abstracts/postgres/repositories/database.postgres.uuid.repository.abstract";
import { Repository } from "typeorm";
import { ApiKeyEntity } from "../entities/api-key.entity";

@Injectable()
export class ApiKeyRepository extends DatabasePostgresIDRepositoryAbstract<ApiKeyEntity> {
  constructor(
    @InjectRepository(ApiKeyEntity)
    private readonly apiKeyModel: Repository<ApiKeyEntity>,
  ) {
    super(apiKeyModel);
  }
}
