import { ExecutionContext, NotFoundException } from "@nestjs/common";
import { createMock } from "@golevelup/ts-jest";
import { CustomerSoftDeletedGuard } from "src/modules/customer/guards/customer.soft-delete.guard";
import { Customer } from "src/modules/customer/repository/entities/customer.entity";

describe("CustomerSoftDeleteGuard", () => {
  let customerSoftDeleteGuard: CustomerSoftDeletedGuard;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    customerSoftDeleteGuard = new CustomerSoftDeletedGuard();
    mockContext = createMock<ExecutionContext>();
  });

  it("should pass if have __customer.deleteAt on app request", async () => {
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: () => {
        return {
          __customer: {
            deletedAt: new Date(),
          } as Customer,
        };
      },
    } as any);

    const result = await customerSoftDeleteGuard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it("should throw NotFoundException if not have __customer.deleteAt on app request", async () => {
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: () => {
        return {
          __customer: {},
        };
      },
    } as any);

    await expect(customerSoftDeleteGuard.canActivate(mockContext)).rejects.toThrow(
      NotFoundException,
    );
  });
});
