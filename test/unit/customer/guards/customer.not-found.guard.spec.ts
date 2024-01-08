import { ExecutionContext, NotFoundException } from "@nestjs/common";
import { createMock } from "@golevelup/ts-jest";
import { CustomerNotFoundGuard } from "src/modules/customer/guards/customer.not-found.guard";
import { Customer } from "src/modules/customer/repository/entities/customer.entity";

describe("CustomerNotFoundGuard", () => {
  let customerNotFoundGuard: CustomerNotFoundGuard;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    customerNotFoundGuard = new CustomerNotFoundGuard();
    mockContext = createMock<ExecutionContext>();
  });

  it("should pass if have __customer on app request", async () => {
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: () => {
        return {
          __customer: {} as Customer,
        };
      },
    } as any);

    const result = await customerNotFoundGuard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it("should throw NotFoundException if not have __customer on app request", async () => {
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: () => {
        return {};
      },
    } as any);

    await expect(customerNotFoundGuard.canActivate(mockContext)).rejects.toThrow(NotFoundException);
  });
});
