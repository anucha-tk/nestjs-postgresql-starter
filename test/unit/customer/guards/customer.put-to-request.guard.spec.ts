import { ExecutionContext } from "@nestjs/common";
import { createMock } from "@golevelup/ts-jest";
import { Test, TestingModule } from "@nestjs/testing";
import { CustomerPutToRequestGuard } from "src/modules/customer/guards/customer.put-to-request.guard";
import CustomerService from "src/modules/customer/services/customer.service";
import { Customer } from "src/modules/customer/repository/entities/customer.entity";
import { Reflector } from "@nestjs/core";

describe("CustomerPutToRequestGuard", () => {
  let reflector: Reflector;
  let customerPutToRequestGuard: CustomerPutToRequestGuard;
  let mockContext: ExecutionContext;
  let customerService: CustomerService;

  const mockId = 1;
  const customer = new Customer();
  customer.id = mockId;

  beforeAll(async () => {
    reflector = new Reflector();
    const modRef: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CustomerService,
          useValue: {
            findOne: jest.fn().mockImplementation(({ id }) => {
              if (id === mockId) {
                const customer = new Customer();
                customer.id = mockId;

                return customer;
              } else {
                return undefined;
              }
            }),
          },
        },
      ],
    }).compile();

    customerService = modRef.get<CustomerService>(CustomerService);
    customerPutToRequestGuard = new CustomerPutToRequestGuard(customerService, reflector);
    mockContext = createMock<ExecutionContext>();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return undefined when customer not exist", async () => {
    const mockRequest = {
      params: {
        customer: 2,
      },
      __customer: undefined,
    } as any;

    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    } as any);

    const result = await customerPutToRequestGuard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.__customer).toEqual(undefined);
  });

  it("should return customer entity when exist", async () => {
    const mockRequest = {
      params: {
        customer: 1,
      },
      __customer: undefined,
    } as any;

    jest.spyOn(mockContext, "switchToHttp").mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    } as any);

    const result = await customerPutToRequestGuard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.__customer).toEqual(customer);
  });
});
