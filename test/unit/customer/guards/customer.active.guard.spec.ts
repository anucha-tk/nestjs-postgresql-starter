import { createMock } from "@golevelup/ts-jest";
import { BadRequestException, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { CustomerActiveGuard } from "src/modules/customer/guards/customer.active.guard";
import { Customer } from "src/modules/customer/repository/entities/customer.entity";

describe("CustomerActiveGuard", () => {
  let reflector: Reflector;
  let customerActiveGuard: CustomerActiveGuard;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    customerActiveGuard = new CustomerActiveGuard(reflector);
    mockContext = createMock<ExecutionContext>();
  });

  it("should pass if not required metadata", async () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: () => {
        return {};
      },
    } as any);

    const result = await customerActiveGuard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it("should pass if active match required metadata", async () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue([true]);
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: () => {
        return {
          __customer: { isActive: true } as Customer,
        };
      },
    } as any);

    const result = await customerActiveGuard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it("should throw BadRequestException if isActive not match required metadata", async () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue([false]);
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: () => {
        return {
          __customer: { isActive: true } as Customer,
        };
      },
    } as any);

    await expect(customerActiveGuard.canActivate(mockContext)).rejects.toThrow(BadRequestException);
  });
});
