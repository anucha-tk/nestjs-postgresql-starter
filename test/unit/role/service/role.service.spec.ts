import { Test, TestingModule } from "@nestjs/testing";
import { RoleService } from "src/modules/role/services/role.service";
import { RoleRepository } from "src/modules/role/repository/repositories/role.repository";
import { PermissionRepository } from "src/modules/role/repository/repositories/permission.repository";
import { faker } from "@faker-js/faker";
import { RoleEntity } from "src/modules/role/repository/entities/role.entity";
import { RoleCreateDto } from "src/modules/role/dtos/role.create.dto";
import { ENUM_ROLE_TYPE } from "src/modules/role/constants/role.enum.constant";
import {
  ENUM_POLICY_ACTION,
  ENUM_POLICY_SUBJECT,
} from "src/common/policy/constants/policy.enum.constant";
import { PermissionEntity } from "src/modules/role/repository/entities/permission.entity";
import { PermissionService } from "src/modules/role/services/permission.service";

describe("role service", () => {
  let roleService: RoleService;
  let roleRepository: RoleRepository;
  const roleId = faker.helpers.rangeToNumber({ min: 1, max: 100 });
  const permissionsId = faker.helpers.rangeToNumber({ min: 1, max: 100 });

  beforeAll(async () => {
    const modRef: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        PermissionService,
        {
          provide: PermissionRepository,
          useValue: {
            findOne: jest.fn().mockImplementation(() => {
              const find = new PermissionEntity();
              find.id = permissionsId;
              find.subject = ENUM_POLICY_SUBJECT.USER;
              find.action = ENUM_POLICY_ACTION.READ;

              return find;
            }),
            save: jest.fn().mockImplementation(({ subject, action, roles }) => {
              const find = new PermissionEntity();
              find.id = roleId;
              find.subject = subject;
              find.action = action;
              find.roles = roles;

              return find;
            }),
            deleteAll: jest.fn().mockResolvedValue(true),
            createMany: jest
              .fn()
              .mockResolvedValue([new PermissionEntity(), new PermissionEntity()]),
            findOneByName: jest.fn().mockImplementation(({ name }) => {
              const find = new RoleEntity();
              find.id = roleId;
              find.name = name;

              return find;
            }),
          },
        },
        {
          provide: RoleRepository,
          useValue: {
            findAll: jest.fn().mockResolvedValue([new RoleEntity(), new RoleEntity()]),
            findOne: jest.fn().mockImplementation(({ name, description, type, isActive }) => {
              const find = new RoleEntity();
              find.name = name;
              find.description = description;
              find.type = type;
              find.isActive = isActive;

              return find;
            }),
            findOneById: jest.fn().mockImplementation((id) => {
              const find = new RoleEntity();
              find.id = id;
              return find;
            }),
            save: jest.fn().mockImplementation(({ name, description, type, isActive }) => {
              const find = new RoleEntity();
              find.id = roleId;
              find.name = name;
              find.description = description;
              find.type = type;
              find.isActive = isActive;

              return find;
            }),
            exists: jest.fn().mockResolvedValue(true),
            deleteAll: jest.fn().mockResolvedValue(true),
            createMany: jest.fn().mockResolvedValue(true),
            findOneLeftJoin: jest.fn().mockImplementation((id) => {
              const find = new RoleEntity();
              const permission = new PermissionEntity();
              find.id = id;
              find.permissions = [permission];

              return find;
            }),
            softDelete: jest.fn().mockResolvedValue(true),
            restore: jest.fn().mockResolvedValue(true),
            getTotal: jest.fn().mockResolvedValue(10),
          },
        },
      ],
    }).compile();

    roleService = modRef.get<RoleService>(RoleService);
    roleRepository = modRef.get<RoleRepository>(RoleRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should return roleEntity", async () => {
      const dto: RoleCreateDto = {
        name: faker.word.words(),
        description: faker.word.words(3),
        type: ENUM_ROLE_TYPE.SUPER_ADMIN,
        permissions: [
          {
            subject: ENUM_POLICY_SUBJECT.API_KEY,
            action: [ENUM_POLICY_ACTION.MANAGE, ENUM_POLICY_ACTION.READ],
          },
        ],
      };
      const result = await roleService.create(dto);

      expect(result instanceof RoleEntity).toBeTruthy();
      expect(roleRepository.save).toBeCalledTimes(2);
    });

    it("should return roleEntity and unique permissions when send same permissions", async () => {
      const dto: RoleCreateDto = {
        name: faker.word.words(),
        description: faker.word.words(3),
        type: ENUM_ROLE_TYPE.SUPER_ADMIN,
        permissions: [
          {
            subject: ENUM_POLICY_SUBJECT.API_KEY,
            action: [ENUM_POLICY_ACTION.MANAGE, ENUM_POLICY_ACTION.MANAGE],
          },
        ],
      };
      const result = await roleService.create(dto);

      expect(result instanceof RoleEntity).toBeTruthy();
    });
  });

  describe("exists", () => {
    it("should return true when not exist", async () => {
      const result = await roleService.existByName("abc");

      expect(roleRepository.exists).toBeCalledWith({ name: "abc" }, { withDeleted: true });
      expect(result).toBeTruthy();
    });
    it("should return false and default true withDeleted", async () => {
      jest.spyOn(roleRepository, "exists").mockResolvedValue(false);
      const result = await roleService.existByName("abc", { withDeleted: false });

      expect(roleRepository.exists).toBeCalledWith({ name: "abc" }, { withDeleted: true });
      expect(result).toBeFalsy();
    });
  });

  describe("findOne", () => {
    it("should return roleEntity", async () => {
      const result = await roleService.findOne({ name: "abc" });

      expect(result instanceof RoleEntity).toBeTruthy();
      expect(roleRepository.findOne).toBeCalledWith({ name: "abc" }, undefined);
    });
  });

  describe("findOneById", () => {
    it("should return roleEntity", async () => {
      const result = await roleService.findOneById(roleId);

      expect(result instanceof RoleEntity).toBeTruthy();
      expect(roleRepository.findOneById).toBeCalledWith(roleId, undefined);
    });
  });

  describe("deleteAll", () => {
    it("should return true when deleteAll success", async () => {
      const result = await roleService.deleteAll();

      expect(result).toBeTruthy();
    });
  });

  describe("createMany", () => {
    it("should return true when createMany success", async () => {
      const dto: RoleCreateDto[] = [
        {
          name: faker.word.words(),
          description: faker.word.words(3),
          type: ENUM_ROLE_TYPE.SUPER_ADMIN,
          permissions: [
            {
              subject: ENUM_POLICY_SUBJECT.API_KEY,
              action: [ENUM_POLICY_ACTION.MANAGE, ENUM_POLICY_ACTION.READ, ENUM_POLICY_ACTION.READ],
            },
          ],
        },
        {
          name: faker.word.words(),
          description: faker.word.words(3),
          type: ENUM_ROLE_TYPE.ADMIN,
          permissions: [
            {
              subject: ENUM_POLICY_SUBJECT.USER,
              action: [ENUM_POLICY_ACTION.MANAGE, ENUM_POLICY_ACTION.CREATE],
            },
          ],
        },
      ];
      const result = await roleService.createMany(dto);

      expect(result).toBeTruthy();
    });
  });

  describe("findOneByName", () => {
    it("should return roleEntity when findByName", async () => {
      const result = await roleService.findOneByName("abc");

      expect(result.name).toBe("abc");
      expect(result instanceof RoleEntity).toBeTruthy();
      expect(roleRepository.findOne).toBeCalledWith({ name: "abc" }, undefined);
    });
  });

  describe("updateName", () => {
    it("should return roleEntity when updateName", async () => {
      const role = new RoleEntity();
      const roleUpdateDto = {
        name: "abc",
        description: "xyz",
      };

      const result = await roleService.updateName(role, roleUpdateDto);

      expect(result instanceof RoleEntity).toBeTruthy();
    });
  });

  describe("findOneWithPermissions", () => {
    it("should return roleEntity with permission", async () => {
      const result = await roleService.findOneWithPermissions(1);

      expect(result instanceof RoleEntity).toBeTruthy();
      expect(result.permissions[0] instanceof PermissionEntity).toBeTruthy();
      expect(roleRepository.findOneLeftJoin).toBeCalledWith({
        id: 1,
        field: "permissions",
      });
    });
  });

  describe("updatePermissions", () => {
    it("should return roleEntity when updatePermissions", async () => {
      const role = new RoleEntity();
      const roleUpdatePermissionDto = {
        type: ENUM_ROLE_TYPE.USER,
        permissions: [],
      };
      const result = await roleService.updatePermissions(role, roleUpdatePermissionDto);
      expect(result instanceof RoleEntity).toBeTruthy();
    });
  });

  describe("inActive", () => {
    it("should return false isActive role", async () => {
      const result = await roleService.inActive(new RoleEntity());

      expect(result).toBeDefined();
      expect(result.isActive).toBeFalsy();
      expect(roleRepository.save).toBeCalled();
    });
  });

  describe("active", () => {
    it("should return true isActive role", async () => {
      const result = await roleService.active(new RoleEntity());

      expect(result).toBeDefined();
      expect(result.isActive).toBeTruthy();
      expect(roleRepository.save).toBeCalled();
    });
  });

  describe("softDelete", () => {
    it("should return true when softDelete role", async () => {
      const result = await roleService.softDelete(1);

      expect(result).toBeTruthy();
      expect(roleRepository.softDelete).toBeCalledTimes(1);
    });
  });
  describe("restore", () => {
    it("should return true when softDelete role", async () => {
      const result = await roleService.restore(1);

      expect(result).toBeTruthy();
      expect(roleRepository.restore).toBeCalledTimes(1);
    });
  });

  describe("getTotal", () => {
    it("should return number", async () => {
      const result = await roleService.getTotal();

      expect(result).toBe(10);
    });
  });

  describe("findAll", () => {
    const findAllOptions = {
      paging: {
        take: 10,
        skip: 20,
      },
      order: { name: "asc" },
      relations: { permissions: true },
    };

    it("should return array roleEntity", async () => {
      const results = await roleService.findAll({ options: findAllOptions });

      expect(results).toBeDefined();
      expect(roleRepository.findAll).toBeCalledWith({ options: findAllOptions });
    });
  });
});
