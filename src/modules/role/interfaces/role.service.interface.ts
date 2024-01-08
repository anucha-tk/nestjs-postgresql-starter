import {
  IDatabaseWithDeletedOptions,
  IDatabaseFindOneOptions,
  IDatabaseFindAll,
} from "src/common/database/interfaces/database.interface";
import { RoleEntity } from "../repository/entities/role.entity";
import { RoleCreateDto } from "../dtos/role.create.dto";
import { RoleUpdatePermissionsDto } from "../dtos/role.update-permissions.dto";
import { RoleUpdateNameDto } from "../dtos/role.update-name.dto";

export interface IRoleService {
  create(data: RoleCreateDto): Promise<RoleEntity>;
  createMany(data: RoleCreateDto[]): Promise<boolean>;

  findAll(find: IDatabaseFindAll): Promise<RoleEntity[]>;
  findOne(find: Record<string, any>, options?: IDatabaseFindOneOptions): Promise<RoleEntity>;
  findOneById(id: number, options?: IDatabaseFindOneOptions): Promise<RoleEntity>;
  findOneByName(name: string, options?: IDatabaseFindOneOptions): Promise<RoleEntity | null>;
  findOneWithPermissions(id: number): Promise<RoleEntity>;
  existByName(name: string, options?: IDatabaseWithDeletedOptions): Promise<boolean>;
  deleteAll(): Promise<boolean>;
  updateName(repository: RoleEntity, { name, description }: RoleUpdateNameDto): Promise<RoleEntity>;
  updatePermissions(
    repository: RoleEntity,
    { type, permissions }: RoleUpdatePermissionsDto,
  ): Promise<RoleEntity>;
  inActive(repository: RoleEntity): Promise<RoleEntity>;
  active(repository: RoleEntity): Promise<RoleEntity>;
  softDelete(id: number): Promise<boolean>;
  restore(id: number): Promise<boolean>;
  getTotal(
    find?: Record<string, any>,
    search?: Record<string, any>[],
    options?: IDatabaseWithDeletedOptions,
  ): Promise<number>;
}
