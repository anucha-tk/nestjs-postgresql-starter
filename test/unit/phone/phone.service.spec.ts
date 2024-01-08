import { faker } from "@faker-js/faker";
import { Test, TestingModule } from "@nestjs/testing";
import { Customer } from "src/modules/customer/repository/entities/customer.entity";
import { Phone } from "src/modules/phone/repository/entities/phone.entity";
import { PhoneRepository } from "src/modules/phone/repository/repositories/phone.repository";
import PhoneService from "src/modules/phone/services/phone.service";

describe("phoneNumber service", () => {
  let phoneService: PhoneService;
  let phoneRepository: PhoneRepository;
  const id = faker.number.int(1000);

  beforeAll(async () => {
    const modRef: TestingModule = await Test.createTestingModule({
      providers: [
        PhoneService,
        {
          provide: PhoneRepository,
          useValue: {
            findOneById: jest.fn().mockImplementation(({ id }) => {
              const find = new Phone();
              find.id = id;
              return find;
            }),
            createInstance: jest.fn().mockImplementation(({ name, phoneNumber, isActive }) => {
              const create = new Phone();

              create.id = id;
              create.name = name;
              create.phoneNumber = phoneNumber;
              create.isActive = isActive;

              return create;
            }),
            save: jest.fn().mockImplementation(({ name, phoneNumber, isActive }) => {
              const create = new Phone();

              create.id = id;
              create.name = name;
              create.phoneNumber = phoneNumber;
              create.isActive = isActive;

              return create;
            }),
            delete: jest.fn().mockResolvedValue(true),
            deleteMany: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    phoneService = modRef.get<PhoneService>(PhoneService);
    phoneRepository = modRef.get<PhoneRepository>(PhoneRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should return phoneNumber entity", async () => {
      const phoneNumberCreateDto = {
        name: faker.person.firstName(),
        phoneNumber: faker.phone.number("#########"),
        customer: new Customer(),
      };
      const result = await phoneService.createPhoneCustomer(phoneNumberCreateDto);

      expect(result).toBeInstanceOf(Phone);
      expect(phoneRepository.save).toBeCalledTimes(1);
      expect(phoneRepository.save).toBeCalledWith({
        ...phoneNumberCreateDto,
        isActive: true,
      });
    });
  });

  describe("findOneById", () => {
    it("should return phoneNumber entity", async () => {
      const result = await phoneService.findOneById(1);

      expect(result).toBeInstanceOf(Phone);
      expect(phoneRepository.findOneById).toBeCalledTimes(1);
      expect(phoneRepository.findOneById).toBeCalledWith(1, undefined);
    });
  });

  describe("inActive", () => {
    it("should return isActive false", async () => {
      const phone = new Phone();
      phone.isActive = true;
      const result = await phoneService.inactive(phone);

      expect(result).toBeInstanceOf(Phone);
      expect(result.isActive).toBeFalsy();
      expect(phoneRepository.save).toBeCalledTimes(1);
      expect(phoneRepository.save).toBeCalledWith({ ...phone, isActive: false });
    });
  });

  describe("active", () => {
    it("should return isActive true", async () => {
      const phone = new Phone();
      phone.isActive = false;
      const result = await phoneService.active(phone);

      expect(result).toBeInstanceOf(Phone);
      expect(result.isActive).toBeTruthy();
      expect(phoneRepository.save).toBeCalledTimes(1);
      expect(phoneRepository.save).toBeCalledWith({ ...phone, isActive: true });
    });
  });

  describe("delete", () => {
    it("should return true", async () => {
      const result = await phoneService.delete(1);

      expect(result).toBeTruthy();
      expect(phoneRepository.delete).toBeCalledTimes(1);
      expect(phoneRepository.delete).toBeCalledWith(1);
    });
  });

  describe("deleteMany", () => {
    it("should return true", async () => {
      const result = await phoneService.deleteMany([1, 2]);

      expect(result).toBeTruthy();
      expect(phoneRepository.deleteMany).toBeCalledTimes(1);
      expect(phoneRepository.deleteMany).toBeCalledWith([1, 2]);
    });
  });

  describe("update", () => {
    it("should return phone entity with update", async () => {
      const phone = new Phone();
      const updateDto = {
        name: "abc",
        phoneNumber: "000000000",
      };
      const result = await phoneService.update(phone, updateDto);

      expect(result).toBeInstanceOf(Phone);
      expect(result).toEqual({
        id: expect.any(Number),
        name: updateDto.name,
        phoneNumber: updateDto.phoneNumber,
      });
      expect(phoneRepository.save).toBeCalledTimes(1);
      expect(phoneRepository.save).toBeCalledWith({ ...phone, ...updateDto });
    });
  });

  describe("createInstance", () => {
    it("should return phone instance", async () => {
      const result = await phoneService.createInstance({ name: "abc", phoneNumber: "000000000" });

      expect(result).toBeInstanceOf(Phone);
      expect(phoneRepository.createInstance).toBeCalledTimes(1);
      expect(phoneRepository.createInstance).toBeCalledWith({
        name: "abc",
        phoneNumber: "000000000",
      });
    });
  });
  describe("createInstances", () => {
    it("should return array phone instances", async () => {
      const dtos = [
        { name: "abc", phoneNumber: "000000000" },
        { name: "xyz", phoneNumber: "999999999" },
      ];
      const result = await phoneService.createInstances(dtos);

      expect(result).toHaveLength(2);
      expect(result).toBeInstanceOf(Array);
      expect(phoneRepository.createInstance).toBeCalledTimes(2);
      result.forEach((e) => {
        expect(e).toBeInstanceOf(Phone);
      });
    });
  });
});
