import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoleEntity } from "./entities/role.entity";
import { PermissionEntity } from "./entities/permission.entity";
import { RoleRepository } from "./repositories/role.repository";
import { PermissionRepository } from "./repositories/permission.repository";

@Module({
  providers: [RoleRepository, PermissionRepository],
  exports: [RoleRepository, PermissionRepository],
  controllers: [],
  imports: [TypeOrmModule.forFeature([RoleEntity, PermissionEntity])],
})
export class RoleRepositoryModule {}
