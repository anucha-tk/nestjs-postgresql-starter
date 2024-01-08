import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DatabasePostgresIDRepositoryAbstract } from "src/common/database/abstracts/postgres/repositories/database.postgres.uuid.repository.abstract";
import { Repository } from "typeorm";
import { UserEntity } from "../entities/user.entity";

@Injectable()
export class UserRepository extends DatabasePostgresIDRepositoryAbstract<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userModel: Repository<UserEntity>,
  ) {
    super(userModel);
  }
}
