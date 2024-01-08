import { ExecutionContext, NotFoundException } from "@nestjs/common";
import { createMock } from "@golevelup/ts-jest";
import { UserNotFoundGuard } from "src/modules/user/guards/user.not-found.guard";
import { UserEntity } from "src/modules/user/repository/entities/user.entity";

describe("UserNotFoundGuard", () => {
  let userNotFoundGuard: UserNotFoundGuard;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    userNotFoundGuard = new UserNotFoundGuard();
    mockContext = createMock<ExecutionContext>();
  });

  it("should pass if have __user on app request", async () => {
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: () => {
        return {
          __user: {} as UserEntity,
        };
      },
    } as any);

    const result = await userNotFoundGuard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it("should throw NotFoundException if not have __user on app request", async () => {
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: () => {
        return {};
      },
    } as any);

    await expect(userNotFoundGuard.canActivate(mockContext)).rejects.toThrow(NotFoundException);
  });
});
