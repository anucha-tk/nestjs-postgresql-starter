import { faker } from "@faker-js/faker";
import { Test, TestingModule } from "@nestjs/testing";
import { Address } from "src/modules/address/repository/entities/address.entity";
import { AddressService } from "src/modules/address/services/address.service";
import { ENUM_CUSTOMER_TYPE } from "src/modules/customer/constants/customer.enum.constant";
import { Customer } from "src/modules/customer/repository/entities/customer.entity";
import { CustomerRepository } from "src/modules/customer/repository/repositories/customer.repository";
import CustomerService from "src/modules/customer/services/customer.service";
import { MedicalTeam } from "src/modules/medicalTeam/repository/entities/medicalTeam.entity";
import MedicalTeamService from "src/modules/medicalTeam/services/medicalTeam.service";
import { Phone } from "src/modules/phone/repository/entities/phone.entity";
import PhoneService from "src/modules/phone/services/phone.service";

describe("Customer Service", () => {
  let customerService: CustomerService;
  let customerRepository: CustomerRepository;
  const customerId = faker.helpers.rangeToNumber({ min: 1, max: 100 });

  beforeAll(async () => {
    const modRef: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        AddressService,
        PhoneService,
        MedicalTeamService,
        {
          provide: AddressService,
          useValue: {
            createInstance: jest.fn().mockResolvedValue(new Address()),
          },
        },
        {
          provide: PhoneService,
          useValue: {
            createInstances: jest.fn().mockResolvedValue([new Phone()]),
          },
        },
        {
          provide: MedicalTeamService,
          useValue: {
            createInstances: jest.fn().mockResolvedValue([new MedicalTeam()]),
          },
        },
        {
          provide: CustomerRepository,
          useValue: {
            findAll: jest.fn().mockResolvedValue([new Customer(), new Customer()]),
            findOneById: jest.fn().mockImplementation((id) => {
              const find = new Customer();
              find.id = id;
              return find;
            }),
            findOne: jest.fn().mockImplementation(({ thaiName, englishName }) => {
              const find = new Customer();
              find.id = customerId;
              find.thaiName = thaiName;
              find.englishName = englishName;
              return find;
            }),
            createInstance: jest
              .fn()
              .mockImplementation(
                ({
                  thaiName,
                  englishName,
                  tax,
                  type,
                  isActive = true,
                  address,
                  phones,
                  medicalTeams,
                }) => {
                  const create = new Customer();
                  create.id = customerId;
                  create.thaiName = thaiName;
                  create.englishName = englishName;
                  create.address = address;
                  create.tax = tax;
                  create.isActive = isActive;
                  create.type = type;
                  create.phones = phones;
                  create.medicalTeams = medicalTeams;

                  return create;
                },
              ),
            save: jest
              .fn()
              .mockImplementation(
                ({
                  thaiName,
                  englishName,
                  tax,
                  type,
                  isActive,
                  address: { street, subDistrict, district, province, postalCode },
                }) => {
                  const address = new Address();
                  if (street && subDistrict && district && province && postalCode) {
                    address.street = street;
                    address.subDistrict = subDistrict;
                    address.district = district;
                    address.province = province;
                    address.postalCode = postalCode;
                  }
                  const create = new Customer();
                  const phone = [new Phone()];
                  const medicalTeams = [new MedicalTeam()];
                  create.id = customerId;
                  create.thaiName = thaiName;
                  create.englishName = englishName;
                  create.address = address;
                  create.tax = tax;
                  create.isActive = isActive;
                  create.type = type;
                  create.phones = phone;
                  create.medicalTeams = medicalTeams;

                  return create;
                },
              ),
            delete: jest.fn().mockResolvedValue(true),
            deleteMany: jest.fn().mockResolvedValue(true),
            deleteAll: jest.fn().mockResolvedValue(true),
            getTotal: jest.fn().mockResolvedValue(10),
            exists: jest.fn().mockResolvedValue(true),
            softDelete: jest.fn().mockResolvedValue(true),
            restore: jest.fn().mockResolvedValue(true),
            softRemove: jest.fn().mockResolvedValue(true),
            recover: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    customerService = modRef.get<CustomerService>(CustomerService);
    customerRepository = modRef.get<CustomerRepository>(CustomerRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createInstance", () => {
    it("should return customer instance", async () => {
      const createCustomerDto = {
        thaiName: "เอบีซี",
        englishName: faker.company.name(),
        tax: "1234546789012",
        type: ENUM_CUSTOMER_TYPE.CLINIC,
        address: new Address(),
        phones: [new Phone()],
        medicalTeams: [new MedicalTeam()],
      };
      const result = await customerService.createInstance(createCustomerDto);

      expect(result).toBeInstanceOf(Customer);
      expect(customerRepository.createInstance).toBeCalledTimes(1);
      expect(result.isActive).toBeTruthy();
    });
  });

  describe("create", () => {
    it("should return customer entity", async () => {
      const createCustomerDto = {
        thaiName: "เอบีซี",
        englishName: faker.company.name(),
        tax: "1234546789012",
        type: ENUM_CUSTOMER_TYPE.CLINIC,
        address: new Address(),
      };
      const result = await customerService.create(createCustomerDto);

      expect(result).toBeInstanceOf(Customer);
      expect(customerRepository.save).toBeCalledTimes(1);
    });
  });

  describe("deleteMany", () => {
    it("should return boolean", async () => {
      const result = await customerService.deleteAll();

      expect(result).toBeTruthy();
    });
  });
  describe("findOneById", () => {
    it("should return customer", async () => {
      const result = await customerService.findOneById(1);

      expect(result).toBeInstanceOf(Customer);
      expect(customerRepository.findOneById).toBeCalledTimes(1);
      expect(customerRepository.findOneById).toBeCalledWith(1, undefined);
    });
  });

  describe("createRaw", () => {
    it("should return customer with isActive", async () => {
      const createRawDto = {
        thaiName: "เอบีซี",
        englishName: faker.company.name(),
        tax: "1234546789012",
        type: ENUM_CUSTOMER_TYPE.CLINIC,
        isActive: false,
        address: new Address(),
        phones: [new Phone()],
        medicalTeams: [new MedicalTeam()],
      };
      const result = await customerService.createRaw(createRawDto);
      expect(result).toBeInstanceOf(Customer);
      expect(result.isActive).toBeFalsy();
    });
  });

  describe("findAll", () => {
    it("should return customers", async () => {
      const results = await customerService.findAll();

      results.forEach((e) => {
        expect(e).toBeInstanceOf(Customer);
      });
      expect(customerRepository.findAll).toBeCalledWith(undefined);
      expect(customerRepository.findAll).toBeCalledTimes(1);
    });
  });

  describe("getTotal", () => {
    it("should return number", async () => {
      const result = await customerService.getTotal();

      expect(typeof result).toBe("number");
      expect(customerRepository.getTotal).toBeCalledTimes(1);
    });
  });

  describe("findOneByThaiName", () => {
    it("should return customer thaiName", async () => {
      const result = await customerService.findOneByThaiName("abc");

      expect(result).toBeInstanceOf(Customer);
      expect(customerRepository.findOne).toBeCalledTimes(1);
      expect(customerRepository.findOne).toBeCalledWith({ thaiName: "abc" }, undefined);
    });
  });
  describe("findOneByEnglishName", () => {
    it("should return customer englishName", async () => {
      const result = await customerService.findOneByEnglishName("xyz");

      expect(result).toBeInstanceOf(Customer);
      expect(customerRepository.findOne).toBeCalledTimes(1);
      expect(customerRepository.findOne).toBeCalledWith({ englishName: "xyz" }, undefined);
    });
  });
  describe("existByThaiName", () => {
    it("should return boolean", async () => {
      const result = await customerService.existByThaiName("abc");

      expect(result).toBeTruthy();
      expect(customerRepository.exists).toBeCalledTimes(1);
      expect(customerRepository.exists).toBeCalledWith({ thaiName: "abc" }, { withDeleted: true });
    });
  });
  describe("existByEnglishName", () => {
    it("should return boolean", async () => {
      const result = await customerService.existByEnglishName("xyz");

      expect(result).toBeTruthy();
      expect(customerRepository.exists).toBeCalledTimes(1);
      expect(customerRepository.exists).toBeCalledWith(
        { englishName: "xyz" },
        { withDeleted: true },
      );
    });
  });
  describe("inactive", () => {
    it("should return false", async () => {
      const result = await customerService.inActive(new Customer());

      expect(result).toBeInstanceOf(Customer);
      expect(result.isActive).toBeFalsy();
      expect(customerRepository.save).toBeCalledTimes(1);
    });
  });
  describe("active", () => {
    it("should return true", async () => {
      const result = await customerService.active(new Customer());

      expect(result).toBeInstanceOf(Customer);
      expect(result.isActive).toBeTruthy();
      expect(customerRepository.save).toBeCalledTimes(1);
    });
  });
  describe("softDelete", () => {
    it("should return boolean", async () => {
      const result = await customerService.softDelete(1);

      expect(typeof result).toBe("boolean");
      expect(result).toBeTruthy();
      expect(customerRepository.softDelete).toBeCalledWith(1);
      expect(customerRepository.softDelete).toBeCalledTimes(1);
    });
  });
  describe("restore", () => {
    it("should return boolean", async () => {
      const result = await customerService.restore(1);

      expect(typeof result).toBe("boolean");
      expect(result).toBeTruthy();
      expect(customerRepository.restore).toBeCalledWith(1);
      expect(customerRepository.restore).toBeCalledTimes(1);
    });
  });
  describe("softRemove", () => {
    it("should return boolean", async () => {
      const result = await customerService.softRemove(new Customer());

      expect(typeof result).toBe("boolean");
      expect(result).toBeTruthy();
      expect(customerRepository.softRemove).toBeCalledTimes(1);
    });
  });
  describe("recover", () => {
    it("should return boolean", async () => {
      const result = await customerService.recover(new Customer());

      expect(typeof result).toBe("boolean");
      expect(result).toBeTruthy();
      expect(customerRepository.recover).toBeCalledTimes(1);
    });
  });
  describe("delete", () => {
    it("should return boolean", async () => {
      const { id } = new Customer();
      const result = await customerService.delete(id);

      expect(typeof result).toBe("boolean");
      expect(result).toBeTruthy();
      expect(customerRepository.delete).toBeCalledTimes(1);
    });
  });
  describe("deleteMany", () => {
    it("should return boolean", async () => {
      const customer = new Customer();
      const customerTwo = new Customer();
      const result = await customerService.deleteMany([customer.id, customerTwo.id]);

      expect(typeof result).toBe("boolean");
      expect(result).toBeTruthy();
      expect(customerRepository.deleteMany).toBeCalledTimes(1);
    });
  });
  describe("update", () => {
    it("should return updated customer", async () => {
      const customer = new Customer();
      const dto = {
        thaiName: "เอบีซี",
        englishName: faker.company.name(),
        tax: "1234546789012",
        type: ENUM_CUSTOMER_TYPE.CLINIC,
      };
      const result = await customerService.update(customer, dto);
      expect(result).toBeInstanceOf(Customer);
      expect(result.thaiName).toBe(dto.thaiName);
      expect(result.englishName).toBe(dto.englishName);
      expect(result.tax).toBe(dto.tax);
      expect(result.type).toBe(dto.type);
      expect(customerRepository.save).toBeCalledWith({ ...customer, ...dto });
      expect(customerRepository.save).toBeCalledTimes(1);
    });
  });

  describe("updateAddress", () => {
    it("should return updated address customer", async () => {
      const customer = new Customer();
      customer.address = new Address();
      const dto = {
        street: faker.location.street(),
        subDistrict: faker.location.city(),
        district: faker.location.county(),
        province: faker.location.state(),
        postalCode: faker.location.zipCode("#####"),
      };
      const result = await customerService.updateAddress(customer, dto);
      expect(result).toBeInstanceOf(Customer);
      expect(result.address.street).toBe(dto.street);
      expect(result.address.subDistrict).toBe(dto.subDistrict);
      expect(result.address.district).toBe(dto.district);
      expect(result.address.province).toBe(dto.province);
      expect(result.address.postalCode).toBe(dto.postalCode);
      expect(customerRepository.save).toBeCalledWith({ ...customer, address: { ...dto } });
      expect(customerRepository.save).toBeCalledTimes(1);
    });
  });
});
