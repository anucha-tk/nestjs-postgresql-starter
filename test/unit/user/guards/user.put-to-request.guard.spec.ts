import { ExecutionContext } from "@nestjs/common";
import { createMock } from "@golevelup/ts-jest";
import { UserPutToRequestGuard } from "src/modules/user/guards/user.put-to-request.guard";
import { UserService } from "src/modules/user/services/user.service";
import { faker } from "@faker-js/faker";
import { Test, TestingModule } from "@nestjs/testing";
import { HelperDateService } from "src/common/helper/services/helper.date.service";
import { Reflector } from "@nestjs/core";
import { UserEntity } from "src/modules/user/repository/entities/user.entity";

describe("UserPutToRequestGuard", () => {
  let reflector: Reflector;
  let userPutToRequestGuard: UserPutToRequestGuard;
  let mockContext: ExecutionContext;
  let userService: UserService;

  const mockId = faker.number.int(100);
  const user = new UserEntity();
  user.id = mockId;

  beforeAll(async () => {
    reflector = new Reflector();
    const modRef: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserService,
          useValue: {
            joinWithRole: jest.fn().mockImplementation((id) => {
              if (id === mockId) {
                const user = new UserEntity();
                user.id = mockId;

                return user;
              } else {
                return undefined;
              }
            }),
          },
        },
        HelperDateService,
      ],
    }).compile();

    userService = modRef.get<UserService>(UserService);
    userPutToRequestGuard = new UserPutToRequestGuard(userService, reflector);
    mockContext = createMock<ExecutionContext>();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return request.__user equal undefined when user not exist", async () => {
    const mockRequest = {
      params: {
        user: faker.number.int(100),
      },
      __user: undefined, // Initialize with undefined
    } as any;

    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue({});
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    } as any);

    const result = await userPutToRequestGuard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.__user).toEqual(undefined);
  });

  it("should return request.__user equal userDoc when user exist", async () => {
    const mockRequest = {
      params: {
        user: mockId,
      },
      __user: undefined, // Initialize with undefined
    } as any;

    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue({});
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    } as any);

    const result = await userPutToRequestGuard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.__user).toEqual(user);
  });
});
