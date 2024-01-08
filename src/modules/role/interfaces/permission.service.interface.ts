import { IDatabaseFindOneOptions } from "src/common/database/interfaces/database.interface";
import { PermissionEntity } from "../repository/entities/permission.entity";
import { RolePermissionsDto } from "../dtos/role.create.dto";

export interface IPermissionService {
  findOne(
    data: Record<string, any>,
    options?: IDatabaseFindOneOptions,
  ): Promise<PermissionEntity | null>;
  deleteAll(): Promise<boolean>;
  createMany(permissions: RolePermissionsDto[]): Promise<PermissionEntity[]>;
}
