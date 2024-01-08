import { Injectable } from "@nestjs/common";
import { PermissionRepository } from "../repository/repositories/permission.repository";
import { IPermissionService } from "../interfaces/permission.service.interface";
import { RolePermissionsDto } from "../dtos/role.create.dto";
import { PermissionEntity } from "../repository/entities/permission.entity";
import { IDatabaseFindOneOptions } from "src/common/database/interfaces/database.interface";

@Injectable()
export class PermissionService implements IPermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async findOne(
    data: Record<string, any>,
    options?: IDatabaseFindOneOptions,
  ): Promise<PermissionEntity | null> {
    return this.permissionRepository.findOne(data, options);
  }

  async deleteAll(): Promise<boolean> {
    return this.permissionRepository.deleteAll();
  }

  async createMany(permissions: RolePermissionsDto[]): Promise<PermissionEntity[]> {
    const existPermissions: PermissionEntity[] = [];

    for (const permission of permissions) {
      // check permission is exist
      for (const action of permission.action) {
        const existPermission: PermissionEntity = await this.permissionRepository.findOne({
          subject: permission.subject,
          action,
        });
        if (!existPermission) {
          const createPermission = new PermissionEntity();
          createPermission.subject = permission.subject;
          createPermission.action = action;
          const result = await this.permissionRepository.save(createPermission);
          existPermissions.push(result);
        } else {
          existPermissions.push(existPermission);
        }
      }
    }
    return existPermissions;
  }
}
