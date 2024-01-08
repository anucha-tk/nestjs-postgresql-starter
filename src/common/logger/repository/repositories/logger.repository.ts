import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DatabasePostgresIDRepositoryAbstract } from "src/common/database/abstracts/postgres/repositories/database.postgres.uuid.repository.abstract";
import { Repository } from "typeorm";
import { LoggerEntity } from "../entities/logger.entity";

@Injectable()
export class LoggerRepository extends DatabasePostgresIDRepositoryAbstract<LoggerEntity> {
  constructor(
    @InjectRepository(LoggerEntity)
    private readonly loggerModel: Repository<LoggerEntity>,
  ) {
    super(loggerModel);
  }
}
