import { Module } from "@nestjs/common";
import { RoleRepositoryModule } from "./repository/role.repository.module";
import { RoleService } from "./services/role.service";
import { PermissionService } from "./services/permission.service";

@Module({
  controllers: [],
  providers: [RoleService, PermissionService],
  exports: [RoleService, PermissionService],
  imports: [RoleRepositoryModule],
})
export class RoleModule {}
