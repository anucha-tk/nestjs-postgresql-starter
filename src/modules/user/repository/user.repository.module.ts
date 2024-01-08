import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { UserRepository } from "./repositories/user.repository";

@Module({
  providers: [UserRepository],
  exports: [UserRepository],
  controllers: [],
  imports: [TypeOrmModule.forFeature([UserEntity])],
})
export class UserRepositoryModule {}
