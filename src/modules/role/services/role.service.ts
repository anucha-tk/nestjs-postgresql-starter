import { Injectable } from "@nestjs/common";
import {
  IDatabaseWithDeletedOptions,
  IDatabaseFindOneOptions,
  IDatabaseFindAll,
  IDatabaseGetTotal,
} from "src/common/database/interfaces/database.interface";
import { RoleRepository } from "../repository/repositories/role.repository";
import { RoleEntity } from "../repository/entities/role.entity";
import { RoleCreateDto } from "../dtos/role.create.dto";
import { PermissionEntity } from "../repository/entities/permission.entity";
import { IRoleService } from "../interfaces/role.service.interface";
import { PermissionService } from "./permission.service";
import { RoleUpdatePermissionsDto } from "../dtos/role.update-permissions.dto";
import { RoleUpdateNameDto } from "../dtos/role.update-name.dto";

@Injectable()
export class RoleService implements IRoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionService: PermissionService,
  ) {}

  async findAll(find?: IDatabaseFindAll): Promise<RoleEntity[]> {
    return this.roleRepository.findAll(find);
  }

  async findOne(
    data: Record<string, any>,
    options?: IDatabaseFindOneOptions,
  ): Promise<RoleEntity | null> {
    return this.roleRepository.findOne(data, options);
  }

  async findOneById(id: number, options?: IDatabaseFindOneOptions): Promise<RoleEntity | null> {
    return this.roleRepository.findOneById(id, options);
  }

  async findOneByName(name: string, options?: IDatabaseFindOneOptions): Promise<RoleEntity | null> {
    return this.roleRepository.findOne({ name }, options);
  }

  async create({ name, description, type, permissions }: RoleCreateDto) {
    const role: RoleEntity = new RoleEntity();
    role.name = name;
    role.description = description;
    role.type = type;
    role.isActive = true;

    const savedRole = await this.roleRepository.save(role);

    const allPermissions: PermissionEntity[] = await this.permissionService.createMany(permissions);

    savedRole.permissions = allPermissions;
    await this.roleRepository.save(savedRole);

    return savedRole;
  }

  async existByName(name: string, options?: IDatabaseWithDeletedOptions): Promise<boolean> {
    return this.roleRepository.exists({ name }, { ...options, withDeleted: true });
  }

  async deleteAll(): Promise<boolean> {
    return this.roleRepository.deleteAll();
  }

  async createMany(roles: RoleCreateDto[]): Promise<boolean> {
    const create: RoleEntity[] = [];
    for (const data of roles) {
      const permissions: PermissionEntity[] = await this.permissionService.createMany(
        data.permissions,
      );

      const entity: RoleEntity = new RoleEntity();
      entity.name = data.name;
      entity.type = data.type;
      entity.isActive = true;
      entity.permissions = permissions;

      create.push(entity);
    }
    return this.roleRepository.createMany(create);
  }

  async updateName(
    repository: RoleEntity,
    { name, description }: RoleUpdateNameDto,
  ): Promise<RoleEntity> {
    repository.name = name;
    repository.description = description;

    return this.roleRepository.save(repository);
  }

  async findOneWithPermissions(id: number, options?: IDatabaseFindOneOptions): Promise<RoleEntity> {
    return this.roleRepository.findOneLeftJoin({
      id,
      field: "permissions",
      options,
    });
  }

  async updatePermissions(
    repository: RoleEntity,
    { type, permissions }: RoleUpdatePermissionsDto,
  ): Promise<RoleEntity> {
    const existPermission: PermissionEntity[] = await this.permissionService.createMany(
      permissions,
    );

    repository.type = type;
    repository.permissions = existPermission;

    return this.roleRepository.save(repository);
  }

  async inActive(repository: RoleEntity): Promise<RoleEntity> {
    repository.isActive = false;

    return this.roleRepository.save(repository);
  }

  async active(repository: RoleEntity): Promise<RoleEntity> {
    repository.isActive = true;

    return this.roleRepository.save(repository);
  }

  async softDelete(id: number): Promise<boolean> {
    return this.roleRepository.softDelete(id);
  }

  async restore(id: number): Promise<boolean> {
    return this.roleRepository.restore(id);
  }

  async getTotal(find?: IDatabaseGetTotal): Promise<number> {
    return this.roleRepository.getTotal(find);
  }
}
