import { ExecutionContext, NotFoundException } from "@nestjs/common";
import { createMock } from "@golevelup/ts-jest";
import { MedicalTeamNotFoundGuard } from "src/modules/medicalTeam/guards/medicalTeam.not-found.guard";
import { MedicalTeam } from "src/modules/medicalTeam/repository/entities/medicalTeam.entity";

describe("MedicalTeamNotFoundGuard", () => {
  let medicalTeamNotFoundGuard: MedicalTeamNotFoundGuard;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    medicalTeamNotFoundGuard = new MedicalTeamNotFoundGuard();
    mockContext = createMock<ExecutionContext>();
  });

  it("should pass if have __medicalTeam on app request", async () => {
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: () => {
        return {
          __medicalTeam: {} as MedicalTeam,
        };
      },
    } as any);

    const result = await medicalTeamNotFoundGuard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it("should throw NotFoundException if not have __medicalTeam on app request", async () => {
    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: () => {
        return {};
      },
    } as any);

    await expect(medicalTeamNotFoundGuard.canActivate(mockContext)).rejects.toThrow(
      NotFoundException,
    );
  });
});
