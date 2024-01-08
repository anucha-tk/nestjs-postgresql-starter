import { ExecutionContext } from "@nestjs/common";
import { createMock } from "@golevelup/ts-jest";
import { Test, TestingModule } from "@nestjs/testing";
import { PhonePutToRequestGuard } from "src/modules/phone/guards/phone.put-to-request.guard";
import PhoneService from "src/modules/phone/services/phone.service";
import { Phone } from "src/modules/phone/repository/entities/phone.entity";

describe("PhonePutToRequestGuard", () => {
  let phonePutToRequestGuard: PhonePutToRequestGuard;
  let mockContext: ExecutionContext;
  let phoneService: PhoneService;

  const mockId = 1;
  const phone = new Phone();
  phone.id = mockId;

  beforeAll(async () => {
    const modRef: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PhoneService,
          useValue: {
            findOneById: jest.fn().mockImplementation((id) => {
              if (id === mockId) {
                const phone = new Phone();
                phone.id = mockId;

                return phone;
              } else {
                return undefined;
              }
            }),
          },
        },
      ],
    }).compile();

    phoneService = modRef.get<PhoneService>(PhoneService);
    phonePutToRequestGuard = new PhonePutToRequestGuard(phoneService);
    mockContext = createMock<ExecutionContext>();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return undefined when phone not exist", async () => {
    const mockRequest = {
      params: {
        phone: 2,
      },
      __phone: undefined,
    } as any;

    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    } as any);

    const result = await phonePutToRequestGuard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.__phone).toEqual(undefined);
  });

  it("should return phone entity when exist", async () => {
    const mockRequest = {
      params: {
        phone: 1,
      },
      __phone: undefined,
    } as any;

    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    } as any);

    const result = await phonePutToRequestGuard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.__phone).toEqual(phone);
  });
});
