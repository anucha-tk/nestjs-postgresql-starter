import { faker } from "@faker-js/faker";
import { Test, TestingModule } from "@nestjs/testing";
import { Address } from "src/modules/address/repository/entities/address.entity";
import { AddressRepository } from "src/modules/address/repository/repositories/address.repository";
import { AddressService } from "src/modules/address/services/address.service";
import { Customer } from "src/modules/customer/repository/entities/customer.entity";

describe("address service", () => {
  let addressService: AddressService;
  let addressRepository: AddressRepository;
  const id = faker.number.int(1000);

  beforeAll(async () => {
    const modRef: TestingModule = await Test.createTestingModule({
      providers: [
        AddressService,
        {
          provide: AddressRepository,
          useValue: {
            createInstance: jest
              .fn()
              .mockImplementation(({ street, subDistrict, district, province, postalCode }) => {
                const create = new Address();
                const customer = new Customer();

                create.id = id;
                create.street = street;
                create.subDistrict = subDistrict;
                create.district = district;
                create.province = province;
                create.postalCode = postalCode;
                create.customer = customer;

                return create;
              }),
            save: jest
              .fn()
              .mockImplementation(
                ({ street, subDistrict, district, province, postalCode, customer }) => {
                  const create = new Address();

                  create.id = id;
                  create.street = street;
                  create.subDistrict = subDistrict;
                  create.district = district;
                  create.province = province;
                  create.postalCode = postalCode;
                  create.customer = customer;

                  return create;
                },
              ),
          },
        },
      ],
    }).compile();

    addressService = modRef.get<AddressService>(AddressService);
    addressRepository = modRef.get<AddressRepository>(AddressRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createInstance", () => {
    it("should return address instance", async () => {
      const dto = {
        street: faker.location.street(),
        subDistrict: faker.location.city(),
        district: faker.location.county(),
        province: faker.location.state(),
        postalCode: faker.location.zipCode("#####"),
        customer: new Customer(),
      };
      const result = await addressService.createInstance(dto);

      expect(result).toBeInstanceOf(Address);
      expect(addressRepository.createInstance).toBeCalledTimes(1);
    });
  });

  describe("update", () => {
    it("should update address", async () => {
      const address = new Address();
      const customer = new Customer();
      address.customer = customer;

      const dto = {
        street: faker.location.street(),
        subDistrict: faker.location.city(),
        district: faker.location.county(),
        province: faker.location.state(),
        postalCode: faker.location.zipCode("#####"),
      };
      const result = await addressService.update(address, dto);

      expect(result).toBeInstanceOf(Address);
      expect(addressRepository.save).toBeCalledTimes(1);
      expect(addressRepository.save).toBeCalledWith({ ...address, ...dto });
    });
  });
});
