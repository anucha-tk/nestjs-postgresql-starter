import { ExecutionContext, NotFoundException } from "@nestjs/common";
import { createMock } from "@golevelup/ts-jest";
import { UserCanNotOurSelfGuard } from "src/modules/user/guards/user.can-not-ourself.guard";
import { faker } from "@faker-js/faker";
import { UserEntity } from "src/modules/user/repository/entities/user.entity";

describe("UserCanNotOurSelfGuard", () => {
  let userCanNotOurSelfGuard: UserCanNotOurSelfGuard;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    userCanNotOurSelfGuard = new UserCanNotOurSelfGuard();
    mockContext = createMock<ExecutionContext>();
  });

  it("should pass if user auth not equal __user", async () => {
    const id = faker.number.int(100);
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: () => {
        return {
          __user: { id } as UserEntity,
          user: { id: faker.number.int(100) } as UserEntity,
        };
      },
    } as any);

    const result = await userCanNotOurSelfGuard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it("should throw NotFoundException if user auth equal __user", async () => {
    const id = faker.number.int(100);
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: () => {
        return {
          __user: { id } as UserEntity,
          user: { id } as UserEntity,
        };
      },
    } as any);
    await expect(userCanNotOurSelfGuard.canActivate(mockContext)).rejects.toThrow(
      NotFoundException,
    );
  });
});
