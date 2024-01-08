import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DatabasePostgresIDRepositoryAbstract } from "src/common/database/abstracts/postgres/repositories/database.postgres.uuid.repository.abstract";
import { Repository } from "typeorm";
import { PermissionEntity } from "../entities/permission.entity";

@Injectable()
export class PermissionRepository extends DatabasePostgresIDRepositoryAbstract<PermissionEntity> {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionModel: Repository<PermissionEntity>,
  ) {
    super(permissionModel);
  }
}
