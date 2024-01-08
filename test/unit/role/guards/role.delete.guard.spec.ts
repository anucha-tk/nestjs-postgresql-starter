import { ExecutionContext, NotFoundException } from "@nestjs/common";
import { createMock } from "@golevelup/ts-jest";
import { RoleEntity } from "src/modules/role/repository/entities/role.entity";
import { RoleDeletedGuard } from "src/modules/role/guards/role.delete.guard";

describe("RoleRestoreGuard", () => {
  let roleDeleteGuard: RoleDeletedGuard;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    roleDeleteGuard = new RoleDeletedGuard();
    mockContext = createMock<ExecutionContext>();
  });

  it("should pass if have __role.deleteAt on app request", async () => {
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: () => {
        return {
          __role: {
            deletedAt: new Date(),
          } as RoleEntity,
        };
      },
    } as any);

    const result = await roleDeleteGuard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it("should throw NotFoundException if not have __role.deleteAt on app request", async () => {
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: () => {
        return {
          __role: {},
        };
      },
    } as any);

    await expect(roleDeleteGuard.canActivate(mockContext)).rejects.toThrow(NotFoundException);
  });
});
