import { IAuthPassword } from "src/common/auth/interfaces/auth.interface";
import { UserEntity } from "../repository/entities/user.entity";
import { IUserCreate } from "./user.interface";
import {
  IDatabaseFindAll,
  IDatabaseFindOneOptions,
  IDatabaseGetTotal,
  IDatabaseWithDeletedOptions,
} from "src/common/database/interfaces/database.interface";
import { UserPayloadSerialization } from "../serializations/user.payload.serialization";
import { UserUpdateNameDto } from "../dtos/user.update-name.dto";
import { UserUpdateGoogleSSODto } from "../dtos/user.update-google-sso.dto";
import { UserImportDto } from "../dtos/user.import.dto";
import { RoleEntity } from "src/modules/role/repository/entities/role.entity";

export interface IUserService {
  findAll(find?: IDatabaseFindAll): Promise<UserEntity[]>;
  findOne(data: Record<string, any>, options?: IDatabaseFindOneOptions): Promise<UserEntity | null>;
  findOneByEmail(email: string, options?: IDatabaseFindOneOptions): Promise<UserEntity>;
  findOneById(id: number, options?: IDatabaseFindOneOptions): Promise<UserEntity | null>;
  findOneWithRoleId(id: number, options?: IDatabaseFindOneOptions): Promise<UserEntity>;
  create(
    { firstName, lastName, email, mobileNumber, role, signUpFrom, userName }: IUserCreate,
    { passwordExpired, passwordHash, salt, passwordCreated }: IAuthPassword,
  ): Promise<UserEntity>;
  delete(id: number): Promise<boolean>;
  deleteMany(id: number[]): Promise<boolean>;
  deleteAll(): Promise<boolean>;
  increasePasswordAttempt(userEntity: UserEntity): Promise<UserEntity>;
  joinWithRole(id: number, options?: IDatabaseWithDeletedOptions): Promise<UserEntity>;
  resetPasswordAttempt(userEntity: UserEntity): Promise<UserEntity>;
  payloadSerialization(data: UserEntity): Promise<UserPayloadSerialization>;
  existByEmail(email: string): Promise<boolean>;
  existByMobileNumber(mobileNumber: string): Promise<boolean>;
  updatePassword(
    user: UserEntity,
    { passwordHash, passwordExpired, passwordCreated, salt }: IAuthPassword,
  ): Promise<UserEntity>;
  updateName(user: UserEntity, { firstName, lastName }: UserUpdateNameDto): Promise<UserEntity>;
  updateGoogleSSO(
    repository: UserEntity,
    { accessToken, refreshToken }: UserUpdateGoogleSSODto,
  ): Promise<UserEntity>;
  getTotal(find?: IDatabaseGetTotal): Promise<number>;
  existByUsername(username: string): Promise<boolean>;
  softDelete(id: number): Promise<boolean>;
  restore(id: number): Promise<boolean>;
  blocked(repository: UserEntity): Promise<UserEntity>;
  active(repository: UserEntity): Promise<UserEntity>;
  inactive(repository: UserEntity): Promise<UserEntity>;
  inactivePermanent(repository: UserEntity): Promise<UserEntity>;
  import(
    data: UserImportDto[],
    role: RoleEntity,
    { passwordCreated, passwordHash, salt }: IAuthPassword,
  ): Promise<boolean>;
}
