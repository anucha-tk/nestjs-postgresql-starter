import { faker } from "@faker-js/faker";
import { Test, TestingModule } from "@nestjs/testing";
import { Customer } from "src/modules/customer/repository/entities/customer.entity";
import { ENUM_MEDICAL_TEAM } from "src/modules/medicalTeam/constants/medicalTeam.enum.constant";
import { MedicalTeam } from "src/modules/medicalTeam/repository/entities/medicalTeam.entity";
import { MedicalTeamRepository } from "src/modules/medicalTeam/repository/repositories/medicalTeam.repository";
import MedicalTeamService from "src/modules/medicalTeam/services/medicalTeam.service";
import { PhoneCreateDto } from "src/modules/phone/dtos/phone.create.dto";
import { Phone } from "src/modules/phone/repository/entities/phone.entity";
import PhoneService from "src/modules/phone/services/phone.service";

describe("medicalTeam service", () => {
  let medicalTeamService: MedicalTeamService;
  let medicalTeamRepository: MedicalTeamRepository;
  let phoneService: PhoneService;
  const id = faker.number.int(1000);

  beforeAll(async () => {
    const modRef: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalTeamService,
        PhoneService,
        {
          provide: PhoneService,
          useValue: {
            createInstance: jest.fn().mockImplementation(({ name, phoneNumber, isActive }) => {
              const create = new Phone();

              create.id = id;
              create.name = name;
              create.phoneNumber = phoneNumber;
              create.isActive = isActive;

              return create;
            }),
            createInstances: jest.fn().mockImplementation(async (phones: PhoneCreateDto[]) => {
              if (!phones || phones.length === 0) {
                return [];
              }

              return Promise.all(
                phones.map(({ name, phoneNumber }) =>
                  phoneService.createInstance({ name, phoneNumber }),
                ),
              );
            }),
          },
        },
        {
          provide: MedicalTeamRepository,
          useValue: {
            findOne: jest.fn().mockImplementation((id) => {
              const find = new MedicalTeam();
              find.id = id;
              return find;
            }),
            findOneById: jest.fn().mockImplementation((id) => {
              const find = new MedicalTeam();
              find.id = id;
              return find;
            }),
            createInstance: jest
              .fn()
              .mockImplementation(({ name, phones, type, isActive, customer }) => {
                const create = new MedicalTeam();

                create.id = id;
                create.name = name;
                create.type = type;
                create.phones = phones;
                create.isActive = isActive;
                create.customer = customer;

                return create;
              }),
            save: jest.fn().mockImplementation(({ name, phones, type, isActive, customer }) => {
              const create = new MedicalTeam();

              create.id = id;
              create.name = name;
              create.type = type;
              create.phones = phones;
              create.isActive = isActive;
              create.customer = customer;

              return create;
            }),
            delete: jest.fn().mockResolvedValue(true),
            deleteMany: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    medicalTeamService = modRef.get<MedicalTeamService>(MedicalTeamService);
    medicalTeamRepository = modRef.get<MedicalTeamRepository>(MedicalTeamRepository);
    phoneService = modRef.get<PhoneService>(PhoneService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findOneById", () => {
    it("should return medicalTeam entity", async () => {
      const result = await medicalTeamService.findOneById(1);

      expect(result).toBeInstanceOf(MedicalTeam);
      expect(result.id).toBe(1);
      expect(medicalTeamRepository.findOneById).toBeCalledTimes(1);
      expect(medicalTeamRepository.findOneById).toBeCalledWith(1, undefined);
    });
  });
  describe("active", () => {
    it("should return true isActive", async () => {
      const result = await medicalTeamService.active(new MedicalTeam());

      expect(result).toBeInstanceOf(MedicalTeam);
      expect(result.isActive).toBeTruthy();
      expect(medicalTeamRepository.save).toBeCalledTimes(1);
    });
  });
  describe("inactive", () => {
    it("should return false isActive", async () => {
      const result = await medicalTeamService.inactive(new MedicalTeam());

      expect(result).toBeInstanceOf(MedicalTeam);
      expect(result.isActive).toBeFalsy();
      expect(medicalTeamRepository.save).toBeCalledTimes(1);
    });
  });
  describe("delete", () => {
    it("should return true", async () => {
      const result = await medicalTeamService.delete(1);

      expect(result).toBeTruthy();
      expect(medicalTeamRepository.delete).toBeCalledTimes(1);
      expect(medicalTeamRepository.delete).toBeCalledWith(1);
    });
  });
  describe("deleteMany", () => {
    it("should return true", async () => {
      const result = await medicalTeamService.deleteMany([1, 2, 3]);

      expect(result).toBeTruthy();
      expect(medicalTeamRepository.deleteMany).toBeCalledTimes(1);
      expect(medicalTeamRepository.deleteMany).toBeCalledWith([1, 2, 3]);
    });
  });

  describe("create", () => {
    it("should return medicalTeam entity and null phones", async () => {
      const medicalTeam = new MedicalTeam();
      medicalTeam.name = faker.person.firstName();
      medicalTeam.type = ENUM_MEDICAL_TEAM.STAFF;
      medicalTeam.customer = new Customer();

      const result = await medicalTeamService.create(medicalTeam);

      expect(result.phones).toBeNull();
      expect(result).toBeInstanceOf(MedicalTeam);
      expect(result.customer).toBeInstanceOf(Customer);
      expect(medicalTeamRepository.save).toBeCalledTimes(1);
    });
    it("should return medicalTeam entity and two phones entity", async () => {
      const medicalTeam = new MedicalTeam();
      medicalTeam.name = faker.person.firstName();
      medicalTeam.type = ENUM_MEDICAL_TEAM.STAFF;
      medicalTeam.phones = [new Phone(), new Phone()];
      medicalTeam.customer = new Customer();

      const result = await medicalTeamService.create(medicalTeam);

      expect(result.phones).toHaveLength(2);
      expect(result.phones[0]).toBeInstanceOf(Phone);
      expect(result).toBeInstanceOf(MedicalTeam);
      expect(result.customer).toBeInstanceOf(Customer);
      expect(medicalTeamRepository.save).toBeCalledTimes(1);
    });
  });

  describe("findOne", () => {
    it("should return medicalTeam entity", async () => {
      const result = await medicalTeamService.findOne({ id: 1 });

      expect(result).toBeInstanceOf(MedicalTeam);
      expect(medicalTeamRepository.findOne).toBeCalledWith({ id: 1 }, undefined);
      expect(medicalTeamRepository.findOne).toBeCalledTimes(1);
    });
  });

  describe("update", () => {
    it("should return medicalTeam entity new update", async () => {
      const dto = {
        name: "abc",
        type: ENUM_MEDICAL_TEAM.DENTIST,
      };
      const result = await medicalTeamService.update(new MedicalTeam(), dto);

      expect(result).toBeInstanceOf(MedicalTeam);
      expect(result.name).toBe(dto.name);
      expect(result.type).toBe(dto.type);
    });
  });

  describe("createInstance", () => {
    it("should return medicalTeam instance", async () => {
      const dto = {
        name: "abc",
        type: ENUM_MEDICAL_TEAM.OWNER,
        phones: [
          { name: "abc", phoneNumber: "000000000" },
          { name: "xyz", phoneNumber: "999999999" },
        ],
      };
      const result = await medicalTeamService.createInstance(dto);

      expect(result).toBeInstanceOf(MedicalTeam);
      expect(medicalTeamRepository.createInstance).toBeCalledTimes(1);
      expect(medicalTeamRepository.createInstance).toBeCalledWith({
        name: "abc",
        type: ENUM_MEDICAL_TEAM.OWNER,
        phones: [
          { id: expect.any(Number), name: "abc", phoneNumber: "000000000" },
          { id: expect.any(Number), name: "xyz", phoneNumber: "999999999" },
        ],
      });
      expect(phoneService.createInstances).toBeCalledWith(dto.phones);
      expect(phoneService.createInstances).toBeCalledTimes(1);
      result.phones.forEach((e) => {
        expect(e).toBeInstanceOf(Phone);
      });
    });
    it("should return medicalTeam instance and empty phone", async () => {
      const dto = {
        name: "abc",
        type: ENUM_MEDICAL_TEAM.OWNER,
      };
      const result = await medicalTeamService.createInstance(dto);

      expect(result).toBeInstanceOf(MedicalTeam);
      expect(medicalTeamRepository.createInstance).toBeCalledTimes(1);
      expect(medicalTeamRepository.createInstance).toBeCalledWith({
        name: "abc",
        type: ENUM_MEDICAL_TEAM.OWNER,
        phones: [],
      });
      expect(phoneService.createInstances).not.toBeCalled();
    });
  });

  describe("createInstances", () => {
    it("should return array medicalTeam instances", async () => {
      const dtos = [
        {
          name: "abc",
          type: ENUM_MEDICAL_TEAM.OWNER,
          phones: [
            { name: "abc", phoneNumber: "000000000" },
            { name: "xyz", phoneNumber: "999999999" },
          ],
        },
        {
          name: "def",
          type: ENUM_MEDICAL_TEAM.STAFF,
          phones: [
            { name: "123", phoneNumber: "000000000" },
            { name: "avc", phoneNumber: "999999999" },
          ],
        },
      ];
      const result = await medicalTeamService.createInstances(dtos);

      expect(result).toHaveLength(2);
      expect(result).toBeInstanceOf(Array);
      expect(medicalTeamRepository.createInstance).toBeCalledTimes(2);
      result.forEach((e) => {
        expect(e).toBeInstanceOf(MedicalTeam);
        e.phones.forEach((e) => {
          expect(e).toBeInstanceOf(Phone);
        });
      });
      expect(phoneService.createInstances).toBeCalled();
    });
    it("should return array medicalTeam instances and empty phone", async () => {
      const dtos = [
        {
          name: "abc",
          type: ENUM_MEDICAL_TEAM.OWNER,
          phones: [],
        },
        {
          name: "def",
          type: ENUM_MEDICAL_TEAM.STAFF,
        },
      ];
      const result = await medicalTeamService.createInstances(dtos);

      expect(result).toHaveLength(2);
      expect(result).toBeInstanceOf(Array);
      expect(medicalTeamRepository.createInstance).toBeCalledTimes(2);
      result.forEach((e) => {
        expect(e).toBeInstanceOf(MedicalTeam);
      });
      expect(phoneService.createInstances).not.toBeCalled();
    });
  });
});
