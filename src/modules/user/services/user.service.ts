import { Injectable } from "@nestjs/common";
import { HelperDateService } from "src/common/helper/services/helper.date.service";
import { IUserService } from "../interfaces/user.service.interface";
import { UserRepository } from "../repository/repositories/user.repository";
import { IAuthPassword } from "src/common/auth/interfaces/auth.interface";
import { IUserCreate } from "../interfaces/user.interface";
import { UserEntity } from "../repository/entities/user.entity";
import {
  IDatabaseFindAll,
  IDatabaseFindOneOptions,
  IDatabaseGetTotal,
  IDatabaseWithDeletedOptions,
} from "src/common/database/interfaces/database.interface";
import { plainToInstance } from "class-transformer";
import { UserPayloadSerialization } from "../serializations/user.payload.serialization";
import { ILike } from "typeorm";
import { UserUpdateNameDto } from "../dtos/user.update-name.dto";
import { UserUpdateGoogleSSODto } from "../dtos/user.update-google-sso.dto";
import { UserImportDto } from "../dtos/user.import.dto";
import { RoleEntity } from "src/modules/role/repository/entities/role.entity";

@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly helperDateService: HelperDateService,
  ) {}
  async findAll(find?: IDatabaseFindAll): Promise<UserEntity[]> {
    return this.userRepository.findAll(find);
  }
  async findOne(
    data: Record<string, any>,
    options?: IDatabaseFindOneOptions,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne(data, options);
  }

  async findOneWithRoleId(id: number, options?: IDatabaseFindOneOptions): Promise<UserEntity> {
    return this.userRepository.findOne({ role: { id } }, { ...options, relations: { role: true } });
  }

  async findOneById(id: number, options?: IDatabaseFindOneOptions): Promise<UserEntity | null> {
    return this.userRepository.findOneById(id, options);
  }

  async findOneByEmail(email: string, options?: IDatabaseFindOneOptions): Promise<UserEntity> {
    return this.userRepository.findOne({ email }, options);
  }

  async create(
    { firstName, lastName, email, mobileNumber, role, signUpFrom, userName }: IUserCreate,
    { passwordExpired, passwordHash, salt, passwordCreated }: IAuthPassword,
  ): Promise<UserEntity> {
    const create: UserEntity = new UserEntity();
    create.firstName = firstName;
    create.username = userName;
    create.email = email;
    create.password = passwordHash;
    create.role = role;
    create.isActive = true;
    create.inactivePermanent = false;
    create.blocked = false;
    create.lastName = lastName;
    create.salt = salt;
    create.passwordExpired = passwordExpired;
    create.passwordCreated = passwordCreated;
    create.signUpDate = this.helperDateService.create();
    create.passwordAttempt = 0;
    create.mobileNumber = mobileNumber ?? undefined;
    create.signUpFrom = signUpFrom;

    return this.userRepository.save(create);
  }

  async delete(id: number): Promise<boolean> {
    return this.userRepository.delete(id);
  }

  async deleteMany(ids: number[]): Promise<boolean> {
    return this.userRepository.deleteMany(ids);
  }

  async deleteAll(): Promise<boolean> {
    return this.userRepository.deleteAll();
  }

  async increasePasswordAttempt(userEntity: UserEntity): Promise<UserEntity> {
    userEntity.passwordAttempt = ++userEntity.passwordAttempt;

    return this.userRepository.save(userEntity);
  }

  async joinWithRole(id: number, options?: IDatabaseWithDeletedOptions): Promise<UserEntity> {
    return this.userRepository.findOne(
      { id },
      { relations: ["role", "role.permissions"], ...options },
    );
  }

  async resetPasswordAttempt(userEntity: UserEntity): Promise<UserEntity> {
    userEntity.passwordAttempt = 0;

    return this.userRepository.save(userEntity);
  }

  async payloadSerialization(data: UserEntity): Promise<UserPayloadSerialization> {
    return plainToInstance(UserPayloadSerialization, data);
  }

  async existByEmail(email: string): Promise<boolean> {
    return this.userRepository.exists(
      {
        email: ILike(`%${email}%`),
      },
      { withDeleted: true },
    );
  }

  async existByMobileNumber(mobileNumber: string): Promise<boolean> {
    return this.userRepository.exists(
      {
        mobileNumber,
      },
      { withDeleted: true },
    );
  }

  async updatePassword(
    user: UserEntity,
    { passwordHash, passwordExpired, passwordCreated, salt }: IAuthPassword,
  ): Promise<UserEntity> {
    user.password = passwordHash;
    user.passwordExpired = passwordExpired;
    user.passwordCreated = passwordCreated;
    user.salt = salt;

    return this.userRepository.save(user);
  }

  async updateName(
    user: UserEntity,
    { firstName, lastName }: UserUpdateNameDto,
  ): Promise<UserEntity> {
    user.firstName = firstName;
    user.lastName = lastName;

    return this.userRepository.save(user);
  }

  async updateGoogleSSO(
    repository: UserEntity,
    { accessToken, refreshToken }: UserUpdateGoogleSSODto,
  ): Promise<UserEntity> {
    repository.googleAccessToken = accessToken;
    repository.googleRefreshToken = refreshToken;

    return this.userRepository.save(repository);
  }

  async getTotal(find?: IDatabaseGetTotal): Promise<number> {
    return this.userRepository.getTotal(find);
  }

  async existByUsername(username: string): Promise<boolean> {
    return this.userRepository.exists({ username }, { withDeleted: true });
  }

  async softDelete(id: number): Promise<boolean> {
    return this.userRepository.softDelete(id);
  }

  async restore(id: number): Promise<boolean> {
    return this.userRepository.restore(id);
  }

  async blocked(repository: UserEntity): Promise<UserEntity> {
    repository.blocked = true;
    repository.blockedDate = this.helperDateService.create();

    return this.userRepository.save(repository);
  }

  async active(repository: UserEntity): Promise<UserEntity> {
    repository.isActive = true;
    repository.inactiveDate = undefined;

    return this.userRepository.save(repository);
  }

  async inactive(repository: UserEntity): Promise<UserEntity> {
    repository.isActive = false;
    repository.inactiveDate = this.helperDateService.create();

    return this.userRepository.save(repository);
  }

  async inactivePermanent(repository: UserEntity): Promise<UserEntity> {
    repository.isActive = false;
    repository.inactivePermanent = true;
    repository.inactiveDate = this.helperDateService.create();

    return this.userRepository.save(repository);
  }

  async import(
    data: UserImportDto[],
    role: RoleEntity,
    { passwordCreated, passwordHash, salt }: IAuthPassword,
  ): Promise<boolean> {
    const passwordExpired: Date = this.helperDateService.backwardInDays(1);
    const users: UserEntity[] = data.map(
      ({ email, firstName, lastName, mobileNumber, signUpFrom, userName }) => {
        const create: UserEntity = new UserEntity();
        create.firstName = firstName;
        create.username = userName;
        create.email = email;
        create.password = passwordHash;
        create.role = role;
        create.isActive = true;
        create.inactivePermanent = false;
        create.blocked = false;
        create.lastName = lastName;
        create.salt = salt;
        create.passwordExpired = passwordExpired;
        create.passwordCreated = passwordCreated;
        create.signUpDate = this.helperDateService.create();
        create.passwordAttempt = 0;
        create.mobileNumber = mobileNumber ?? undefined;
        create.signUpFrom = signUpFrom;

        return create;
      },
    );

    return this.userRepository.createMany(users);
  }
}
