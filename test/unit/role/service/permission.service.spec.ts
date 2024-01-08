import { PermissionRepository } from "src/modules/role/repository/repositories/permission.repository";
import { faker } from "@faker-js/faker";
import {
  ENUM_POLICY_ACTION,
  ENUM_POLICY_SUBJECT,
} from "src/common/policy/constants/policy.enum.constant";
import { PermissionEntity } from "src/modules/role/repository/entities/permission.entity";
import { PermissionService } from "src/modules/role/services/permission.service";
import { Test, TestingModule } from "@nestjs/testing";
import { RolePermissionsDto } from "src/modules/role/dtos/role.create.dto";

describe("permission service", () => {
  let permissionService: PermissionService;
  let permissionRepository: PermissionRepository;
  const permissionId = faker.helpers.rangeToNumber({ min: 1, max: 100 });

  beforeAll(async () => {
    const modRef: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: PermissionRepository,
          useValue: {
            findOne: jest.fn().mockImplementation(() => {
              const find = new PermissionEntity();
              find.id = permissionId;
              find.subject = ENUM_POLICY_SUBJECT.USER;
              find.action = ENUM_POLICY_ACTION.READ;

              return find;
            }),
            save: jest.fn().mockImplementation(({ subject, action, roles }) => {
              const find = new PermissionEntity();
              find.id = permissionId;
              find.subject = subject;
              find.action = action;
              find.roles = roles;

              return find;
            }),
            deleteAll: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    permissionService = modRef.get<PermissionService>(PermissionService);
    permissionRepository = modRef.get<PermissionRepository>(PermissionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findOne", () => {
    it("should return PermissionEntity", async () => {
      const result = await permissionService.findOne({ subject: ENUM_POLICY_SUBJECT.USER });

      expect(result instanceof PermissionEntity).toBeTruthy();
      expect(permissionRepository.findOne).toBeCalledWith(
        { subject: ENUM_POLICY_SUBJECT.USER },
        undefined,
      );
    });
    it("should return null when notfound", async () => {
      jest.spyOn(permissionRepository, "findOne").mockResolvedValue(null);

      const result = await permissionService.findOne({ subject: ENUM_POLICY_SUBJECT.USER });
      expect(permissionRepository.findOne).toBeCalledWith(
        { subject: ENUM_POLICY_SUBJECT.USER },
        undefined,
      );
      expect(result).toBeNull();
    });
  });

  describe("deleteAll", () => {
    it("should return true when deleteAll success", async () => {
      const result = await permissionService.deleteAll();

      expect(result).toBeTruthy();
    });
  });

  describe("createMany", () => {
    it("should return true when createMany success", async () => {
      const dto: RolePermissionsDto[] = [
        {
          subject: ENUM_POLICY_SUBJECT.API_KEY,
          action: [ENUM_POLICY_ACTION.MANAGE, ENUM_POLICY_ACTION.READ, ENUM_POLICY_ACTION.READ],
        },
        {
          subject: ENUM_POLICY_SUBJECT.USER,
          action: [ENUM_POLICY_ACTION.MANAGE, ENUM_POLICY_ACTION.CREATE],
        },
      ];
      const result = await permissionService.createMany(dto);

      expect(result).toBeTruthy();
      expect(result[0] instanceof PermissionEntity).toBeTruthy();
    });
  });
});
