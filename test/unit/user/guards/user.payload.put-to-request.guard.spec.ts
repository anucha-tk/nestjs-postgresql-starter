import { ExecutionContext } from "@nestjs/common";
import { createMock } from "@golevelup/ts-jest";
import { UserService } from "src/modules/user/services/user.service";
import { faker } from "@faker-js/faker";
import { Test, TestingModule } from "@nestjs/testing";
import { HelperDateService } from "src/common/helper/services/helper.date.service";
import { UserPayloadPutToRequestGuard } from "src/modules/user/guards/payload/user.payload.put-to-request.guard";
import { UserEntity } from "src/modules/user/repository/entities/user.entity";

describe("UserPayloadPutToRequestGuard", () => {
  let userPayloadPutToRequestGuard: UserPayloadPutToRequestGuard;
  let mockContext: ExecutionContext;
  let userService: UserService;

  const mockId = faker.number.int(100);
  const user = new UserEntity();
  user.id = mockId;

  beforeAll(async () => {
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
    userPayloadPutToRequestGuard = new UserPayloadPutToRequestGuard(userService);
    mockContext = createMock<ExecutionContext>();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return request.__user equal undefined", async () => {
    const mockRequest = {
      user: {
        id: faker.number.int(100),
      } as Partial<UserEntity>,
    } as any;

    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    } as any);

    const result = await userPayloadPutToRequestGuard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.__user).toEqual(undefined);
  });
  it("should return request.__user equal userDoc", async () => {
    const mockRequest = {
      user: {
        id: mockId,
      },
    } as any;

    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    } as any);

    const result = await userPayloadPutToRequestGuard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.__user).toEqual(user);
  });
});
