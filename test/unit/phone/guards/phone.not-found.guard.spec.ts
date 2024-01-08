import { ExecutionContext, NotFoundException } from "@nestjs/common";
import { createMock } from "@golevelup/ts-jest";
import { PhoneNotFoundGuard } from "src/modules/phone/guards/phone.not-found.guard";
import { Phone } from "src/modules/phone/repository/entities/phone.entity";

describe("PhoneNotFoundGuard", () => {
  let phoneNotFoundGuard: PhoneNotFoundGuard;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    phoneNotFoundGuard = new PhoneNotFoundGuard();
    mockContext = createMock<ExecutionContext>();
  });

  it("should pass if have __phone on app request", async () => {
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: () => {
        return {
          __phone: {} as Phone,
        };
      },
    } as any);

    const result = await phoneNotFoundGuard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it("should throw NotFoundException if not have __phone on app request", async () => {
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: () => {
        return {};
      },
    } as any);

    await expect(phoneNotFoundGuard.canActivate(mockContext)).rejects.toThrow(NotFoundException);
  });
});
