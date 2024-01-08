import { Reflector } from "@nestjs/core";
import { ExecutionContext, BadRequestException } from "@nestjs/common";
import { createMock } from "@golevelup/ts-jest";
import { MedicalTeamActiveGuard } from "src/modules/medicalTeam/guards/medicalTeam.active.guard";
import { MedicalTeam } from "src/modules/medicalTeam/repository/entities/medicalTeam.entity";

describe("MedicalTeamActiveGuard", () => {
  let reflector: Reflector;
  let medicalTeamActiveGuard: MedicalTeamActiveGuard;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    medicalTeamActiveGuard = new MedicalTeamActiveGuard(reflector);
    mockContext = createMock<ExecutionContext>();
  });

  it("should pass if required metadata is not defined", async () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);
    const result = await medicalTeamActiveGuard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it("should pass if medicalTeam is active and required metadata matches", async () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue([true]);
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: () => {
        return {
          __medicalTeam: {
            isActive: true,
          } as MedicalTeam,
        };
      },
    } as any);

    const result = await medicalTeamActiveGuard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it("should throw BadRequestException if phone is not active", async () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue([true]);
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: () => {
        return {
          __medicalTeam: {
            isActive: false,
          } as MedicalTeam,
        };
      },
    } as any);

    await expect(medicalTeamActiveGuard.canActivate(mockContext)).rejects.toThrow(
      BadRequestException,
    );
  });
});
