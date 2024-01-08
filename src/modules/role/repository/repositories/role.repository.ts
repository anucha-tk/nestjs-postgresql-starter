import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DatabasePostgresIDRepositoryAbstract } from "src/common/database/abstracts/postgres/repositories/database.postgres.uuid.repository.abstract";
import { RoleEntity } from "src/modules/role/repository/entities/role.entity";
import { Repository } from "typeorm";

@Injectable()
export class RoleRepository extends DatabasePostgresIDRepositoryAbstract<RoleEntity> {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleModel: Repository<RoleEntity>,
  ) {
    super(roleModel);
  }
}
