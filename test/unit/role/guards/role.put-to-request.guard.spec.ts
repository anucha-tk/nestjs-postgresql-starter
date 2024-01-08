import { ExecutionContext } from "@nestjs/common";
import { createMock } from "@golevelup/ts-jest";
import { faker } from "@faker-js/faker";
import { Test, TestingModule } from "@nestjs/testing";
import { RolePutToRequestGuard } from "src/modules/role/guards/role.put-to-request.guard";
import { RoleService } from "src/modules/role/services/role.service";
import { RoleEntity } from "src/modules/role/repository/entities/role.entity";
import { Reflector } from "@nestjs/core";

describe("RolePutToRequestGuard", () => {
  let reflector: Reflector;
  let rolePutToRequestGuard: RolePutToRequestGuard;
  let mockContext: ExecutionContext;
  let roleService: RoleService;
  const mockId = 1;
  const role = new RoleEntity();
  role.id = mockId;

  beforeAll(async () => {
    reflector = new Reflector();
    const modRef: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: RoleService,
          useValue: {
            findOneWithPermissions: jest.fn().mockImplementation((id) => {
              if (id === mockId) {
                return role;
              } else {
                return undefined;
              }
            }),
          },
        },
      ],
    }).compile();

    roleService = modRef.get<RoleService>(RoleService);
    rolePutToRequestGuard = new RolePutToRequestGuard(roleService, reflector);
    mockContext = createMock<ExecutionContext>();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return request.__role equal undefined", async () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue([true]);
    const mockRequest = {
      params: {
        role: faker.string.uuid(),
      },
      __role: undefined, // Initialize with undefined
    } as any;

    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    } as any);

    const result = await rolePutToRequestGuard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.__role).toEqual(undefined);
  });
  it("should return request.__role equal roleDoc", async () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue([true]);
    const mockRequest = {
      params: {
        role: mockId,
      },
      __role: undefined, // Initialize with undefined
    } as any;

    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    } as any);

    const result = await rolePutToRequestGuard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.__role).toEqual(role);
  });
});
