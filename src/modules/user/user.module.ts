import { Module } from "@nestjs/common";
import { UserRepositoryModule } from "src/modules/user/repository/user.repository.module";
import { UserService } from "./services/user.service";
import { RoleService } from "../role/services/role.service";
import { RoleRepositoryModule } from "../role/repository/role.repository.module";
import { PermissionService } from "../role/services/permission.service";

@Module({
  imports: [UserRepositoryModule, RoleRepositoryModule],
  exports: [UserService],
  providers: [UserService, RoleService, PermissionService],
  controllers: [],
})
export class UserModule {}
