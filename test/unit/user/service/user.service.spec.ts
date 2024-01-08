import { faker } from "@faker-js/faker";
import { Test, TestingModule } from "@nestjs/testing";
import { IAuthPassword } from "src/common/auth/interfaces/auth.interface";
import { HelperDateService } from "src/common/helper/services/helper.date.service";
import {
  ENUM_POLICY_ACTION,
  ENUM_POLICY_SUBJECT,
} from "src/common/policy/constants/policy.enum.constant";
import { ENUM_ROLE_TYPE } from "src/modules/role/constants/role.enum.constant";
import { PermissionEntity } from "src/modules/role/repository/entities/permission.entity";
import { RoleEntity } from "src/modules/role/repository/entities/role.entity";
import { ENUM_USER_SIGN_UP_FROM } from "src/modules/user/constants/user.enum.constant";
import { UserCreateDto } from "src/modules/user/dtos/user.create.dto";
import { UserEntity } from "src/modules/user/repository/entities/user.entity";
import { UserRepository } from "src/modules/user/repository/repositories/user.repository";
import { UserPayloadSerialization } from "src/modules/user/serializations/user.payload.serialization";
import { UserService } from "src/modules/user/services/user.service";

describe("user service", () => {
  let userService: UserService;
  let userRepository: UserRepository;
  const userId = faker.number.int(1000);
  const user = new UserEntity();

  beforeAll(async () => {
    const modRef: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        HelperDateService,
        {
          provide: UserRepository,
          useValue: {
            findAll: jest.fn().mockResolvedValue([new UserEntity(), new UserEntity()]),
            delete: jest.fn().mockResolvedValue(true),
            deleteMany: jest.fn().mockResolvedValue(true),
            deleteAll: jest.fn().mockResolvedValue(true),
            save: jest
              .fn()
              .mockImplementation(
                ({
                  firstName,
                  email,
                  password,
                  role,
                  lastName,
                  salt,
                  passwordExpired,
                  passwordCreated,
                  mobileNumber,
                  signUpFrom,
                  username,
                  passwordAttempt,
                  signUpDate,
                  blocked,
                  isActive,
                  inactivePermanent,
                  inactiveDate,
                  blockedDate,
                  googleRefreshToken,
                  googleAccessToken,
                }) => {
                  const create = new UserEntity();
                  create.id = userId;
                  create.firstName = firstName;
                  create.lastName = lastName;
                  create.username = username;
                  create.email = email;
                  create.password = password;
                  create.passwordExpired = passwordExpired;
                  create.passwordCreated = passwordCreated;
                  create.passwordAttempt = passwordAttempt;
                  create.mobileNumber = mobileNumber ?? undefined;
                  create.role = role;
                  create.signUpFrom = signUpFrom;
                  create.signUpDate = signUpDate;
                  create.salt = salt;
                  create.isActive = isActive;
                  create.inactiveDate = inactiveDate;
                  create.inactivePermanent = inactivePermanent;
                  create.blocked = blocked;
                  create.blockedDate = blockedDate;
                  create.googleAccessToken = googleAccessToken;
                  create.googleRefreshToken = googleRefreshToken;

                  return create;
                },
              ),

            findOne: jest.fn().mockImplementation(({ id }) => {
              const find = new UserEntity();
              find.id = userId;

              if (id) {
                find.id = id;
              }

              return find;
            }),
            exists: jest.fn().mockResolvedValue(true),
            findOneById: jest.fn().mockImplementation((id) => {
              const find = new UserEntity();
              find.id = id;

              return find;
            }),
            getTotal: jest.fn().mockResolvedValue(10),
            softDelete: jest.fn().mockResolvedValue(true),
            restore: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    userService = modRef.get<UserService>(UserService);
    userRepository = modRef.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should return roleEntity", async () => {
      const role = new RoleEntity();
      const userDtos: UserCreateDto = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        mobileNumber: faker.phone.number(),
        role,
        signUpFrom: ENUM_USER_SIGN_UP_FROM.LOCAL,
        password: "123456",
        userName: faker.person.middleName(),
      };

      const passwordHash: IAuthPassword = {
        passwordExpired: faker.date.future(),
        passwordHash: faker.string.alphanumeric(10),
        salt: faker.string.alphanumeric(),
        passwordCreated: faker.date.recent(),
      };

      const user = await userService.create(userDtos, passwordHash);

      expect(user instanceof UserEntity).toBeTruthy();
      expect(userRepository.save).toBeCalledTimes(1);
    });
  });

  describe("blocked", () => {
    it("should return userDoc true blocked", async () => {
      const result = await userService.blocked(new UserEntity());

      expect(userRepository.save).toHaveBeenCalled();
      expect(result.id).toBe(userId);
      expect(result.blocked).toBeTruthy();
    });
  });

  describe("inActive", () => {
    it("should return userDoc false inactive", async () => {
      const result = await userService.inactive(new UserEntity());

      expect(userRepository.save).toHaveBeenCalled();
      expect(result.id).toBe(userId);
      expect(result.isActive).toBeFalsy();
      expect(result.inactiveDate instanceof Date).toBeTruthy();
    });
  });

  describe("active", () => {
    it("should return userDoc true active", async () => {
      const result = await userService.active(new UserEntity());

      expect(userRepository.save).toHaveBeenCalled();
      expect(result.id).toBe(userId);
      expect(result.isActive).toBeTruthy();
      expect(result.inactiveDate).toBeUndefined();
    });
  });

  describe("inactivePermanent", () => {
    it("should return userDoc true inactivePermanent", async () => {
      const result = await userService.inactivePermanent(new UserEntity());

      expect(userRepository.save).toHaveBeenCalled();
      expect(result.id).toBe(userId);
      expect(result.inactivePermanent).toBeTruthy();
      expect(result.isActive).toBeFalsy();
      expect(result.inactiveDate instanceof Date).toBeTruthy();
    });
  });
  describe("delete", () => {
    it("should return true when delete success", async () => {
      const result = await userService.delete(1);

      expect(result).toBeTruthy();
    });
  });

  describe("deleteMany", () => {
    it("should return true when deleteMany success", async () => {
      const result = await userService.deleteMany([1, 2]);

      expect(result).toBeTruthy();
    });
  });

  describe("deleteAll", () => {
    it("should return true when deleteAll success", async () => {
      const result = await userService.deleteAll();

      expect(result).toBeTruthy();
    });
  });

  describe("findOneByEmail", () => {
    it("should return userDoc when findOneByEmail successful", async () => {
      const email = faker.internet.email();
      const result = await userService.findOneByEmail(email);

      expect(result).toBeDefined();
      expect(result instanceof UserEntity).toBeTruthy();
      expect(userRepository.findOne).toHaveBeenCalled();
      expect(userRepository.findOne).toBeCalledWith({ email }, undefined);
    });
  });

  describe("increasePasswordAttempt", () => {
    it("should save successful", async () => {
      const user = new UserEntity();
      user.passwordAttempt = 0;

      const result = await userService.increasePasswordAttempt(user);

      expect(result).toBeDefined();
      expect(result instanceof UserEntity).toBeTruthy();
      expect(userRepository.save).toBeCalled();
      expect(result.passwordAttempt).toBe(1);
    });
  });
  describe("resetPasswordAttempt", () => {
    it("should save successful", async () => {
      const user = new UserEntity();
      user.passwordAttempt = 1;

      const result = await userService.resetPasswordAttempt(user);

      expect(result).toBeDefined();
      expect(result instanceof UserEntity).toBeTruthy();
      expect(userRepository.save).toBeCalled();
      expect(result.passwordAttempt).toBe(0);
    });
  });

  describe("payloadSerialization", () => {
    it("should return user payloadSerialization", async () => {
      const user = new UserEntity();
      const role = new RoleEntity();

      const permissions1 = new PermissionEntity();
      permissions1.subject = ENUM_POLICY_SUBJECT.USER;
      permissions1.action = ENUM_POLICY_ACTION.READ;

      const permissions2 = new PermissionEntity();
      permissions2.subject = ENUM_POLICY_SUBJECT.USER;
      permissions2.action = ENUM_POLICY_ACTION.CREATE;

      role.type = ENUM_ROLE_TYPE.USER;
      role.permissions = [permissions1, permissions2];

      user.role = role;

      const result = await userService.payloadSerialization(user);

      expect(result instanceof UserPayloadSerialization).toBeTruthy();
    });
  });

  describe("existByEmail", () => {
    it("should return true when user exist", async () => {
      const email = user.email;
      const result = await userService.existByEmail(email);

      expect(result).toBeTruthy();
    });
    it("should return false when user not exist", async () => {
      jest.spyOn(userRepository, "exists").mockResolvedValue(false);
      const email = faker.internet.email();
      const result = await userService.existByEmail(email);

      expect(result).toBeFalsy();
    });
  });

  describe("existByMobileNumber", () => {
    it("should return false when user mobileNumber not exist", async () => {
      jest.spyOn(userRepository, "exists").mockResolvedValue(false);
      const phone = faker.phone.number();
      const result = await userService.existByMobileNumber(phone);

      expect(result).toBeFalsy();
    });
    it("should return true when user mobileNumber exist", async () => {
      jest.spyOn(userRepository, "exists").mockResolvedValue(true);
      const phone = faker.phone.number();
      const result = await userService.existByMobileNumber(phone);

      expect(result).toBeTruthy();
    });
  });

  describe("findOneById", () => {
    it("should return userEntity when findOneById", async () => {
      const result = await userService.findOneById(1);

      expect(result instanceof UserEntity).toBeTruthy();
      expect(userRepository.findOneById).toBeCalledTimes(1);
      expect(userRepository.findOneById).toBeCalledWith(1, undefined);
    });
  });

  describe("findOne", () => {
    it("should return userEntity when findOne", async () => {
      const result = await userService.findOne({ id: 1 });

      expect(result instanceof UserEntity).toBeTruthy();
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith({ id: 1 }, undefined);
    });
  });

  describe("findOneByRoleId", () => {
    it("should return userEntity when findOneByRoleId", async () => {
      const result = await userService.findOneWithRoleId(1);

      expect(result instanceof UserEntity).toBeTruthy();
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(
        { role: { id: 1 } },
        { relations: { role: true } },
      );
    });
  });

  describe("findAll", () => {
    it("should return UserEntity lists", async () => {
      const results = await userService.findAll();

      expect(results).toBeInstanceOf(Array);
      expect(userRepository.findAll).toBeCalledWith(undefined);
    });
  });

  describe("getTotal", () => {
    it("should return number", async () => {
      const result = await userService.getTotal();

      expect(typeof result).toBe("number");
    });
  });

  describe("existByUsername", () => {
    it("should return userEntity username exist", async () => {
      const result = await userService.existByUsername("abc");

      expect(result).toBeTruthy();
      expect(typeof result).toBe("boolean");
    });
  });

  describe("softDelete", () => {
    it("should return true when softDelete role", async () => {
      const result = await userService.softDelete(1);

      expect(result).toBeTruthy();
      expect(userRepository.softDelete).toBeCalledTimes(1);
    });
  });

  describe("restore", () => {
    it("should return true when softDelete role", async () => {
      const result = await userService.restore(1);

      expect(result).toBeTruthy();
      expect(userRepository.restore).toBeCalledTimes(1);
    });
  });
});
