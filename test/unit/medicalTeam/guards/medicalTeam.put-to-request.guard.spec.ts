import { ExecutionContext } from "@nestjs/common";
import { createMock } from "@golevelup/ts-jest";
import { Test, TestingModule } from "@nestjs/testing";
import { MedicalTeamPutToRequestGuard } from "src/modules/medicalTeam/guards/medicalTeam.put-to-request.guard";
import MedicalTeamService from "src/modules/medicalTeam/services/medicalTeam.service";
import { MedicalTeam } from "src/modules/medicalTeam/repository/entities/medicalTeam.entity";

describe("MedicalTeamPutToRequestGuard", () => {
  let medicalTeamPutToRequestGuard: MedicalTeamPutToRequestGuard;
  let mockContext: ExecutionContext;
  let medicalTeamService: MedicalTeamService;

  const mockId = 1;
  const medicalTeam = new MedicalTeam();
  medicalTeam.id = mockId;

  beforeAll(async () => {
    const modRef: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: MedicalTeamService,
          useValue: {
            findOne: jest.fn().mockImplementation(({ id }) => {
              if (id === mockId) {
                const medicalTeam = new MedicalTeam();
                medicalTeam.id = mockId;

                return medicalTeam;
              } else {
                return undefined;
              }
            }),
          },
        },
      ],
    }).compile();

    medicalTeamService = modRef.get<MedicalTeamService>(MedicalTeamService);
    medicalTeamPutToRequestGuard = new MedicalTeamPutToRequestGuard(medicalTeamService);
    mockContext = createMock<ExecutionContext>();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return undefined when medicalTeam not exist", async () => {
    const mockRequest = {
      params: {
        medicalTeam: 2,
      },
      __medicalTeam: undefined,
    } as any;

    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    } as any);

    const result = await medicalTeamPutToRequestGuard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.__medicalTeam).toEqual(undefined);
  });

  it("should return medicalTeam entity when exist", async () => {
    const mockRequest = {
      params: {
        medicalTeam: 1,
      },
      __medicalTeam: undefined,
    } as any;

    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    } as any);

    const result = await medicalTeamPutToRequestGuard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.__medicalTeam).toEqual(medicalTeam);
  });
});
