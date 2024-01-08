import { Reflector } from "@nestjs/core";
import { ExecutionContext, BadRequestException } from "@nestjs/common";
import { createMock } from "@golevelup/ts-jest";
import { PhoneActiveGuard } from "src/modules/phone/guards/phone.active.guard";
import { Phone } from "src/modules/phone/repository/entities/phone.entity";

describe("PhoneActiveGuard", () => {
  let reflector: Reflector;
  let phoneActiveGuard: PhoneActiveGuard;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    phoneActiveGuard = new PhoneActiveGuard(reflector);
    mockContext = createMock<ExecutionContext>();
  });

  it("should pass if required metadata is not defined", async () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);
    const result = await phoneActiveGuard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it("should pass if phone is active and required metadata matches", async () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue([true]);
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: () => {
        return {
          __phone: {
            isActive: true,
          } as Phone,
        };
      },
    } as any);

    const result = await phoneActiveGuard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it("should throw BadRequestException if phone is not active", async () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue([true]);
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: () => {
        return {
          __phone: {
            isActive: false,
          } as Phone,
        };
      },
    } as any);

    await expect(phoneActiveGuard.canActivate(mockContext)).rejects.toThrow(BadRequestException);
  });
});
