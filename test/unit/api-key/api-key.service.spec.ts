import { faker } from "@faker-js/faker";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ENUM_API_KEY_TYPE } from "src/common/api-key/constants/api-key.enum.constant";
import { ApiKeyEntity } from "src/common/api-key/repository/entities/api-key.entity";
import { ApiKeyRepository } from "src/common/api-key/repository/repositories/api-key.repository";
import { ApiKeyService } from "src/common/api-key/services/api-key.service";
import { HelperModule } from "src/common/helper/helper.module";
import configs from "src/configs";

describe("api-key service", () => {
  let apiKeyService: ApiKeyService;
  let apiKeyRepository: ApiKeyRepository;
  const apiKeyId = faker.helpers.rangeToNumber({ min: 1, max: 100 });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: configs,
          isGlobal: true,
          cache: true,
          envFilePath: [".env"],
          expandVariables: true,
        }),
        HelperModule,
      ],
      providers: [
        ApiKeyService,
        {
          provide: ApiKeyRepository,
          useValue: {
            findOne: jest.fn().mockImplementation(({ key }) => {
              const find = new ApiKeyEntity();
              find.id = apiKeyId;

              if (key) {
                find.key = key;
              }

              return find;
            }),
            findOneById: jest.fn().mockImplementation((id) => {
              const find = new ApiKeyEntity();
              find.id = id;

              return find;
            }),
            findAll: jest.fn().mockImplementation((withDeleted) => {
              const apiKeyOne = new ApiKeyEntity();
              const apiKeyTwo = new ApiKeyEntity();
              apiKeyTwo.deletedAt = new Date();
              if (withDeleted) {
                return [apiKeyOne, apiKeyTwo];
              }
              return [apiKeyOne];
            }),
            deleteAll: jest.fn().mockResolvedValue(true),
            createRaw: jest
              .fn()
              .mockImplementation(({ name, key, type, secret, startDate, endDate }) => {
                const find = new ApiKeyEntity();
                find.id = apiKeyId;
                find.name = name;
                find.key = key;
                find.type = type;
                find.startDate = startDate;
                find.endDate = endDate;

                return { doc: find, secret };
              }),
            save: jest.fn().mockImplementation(({ name, key, type, startDate, endDate }) => {
              const find = new ApiKeyEntity();
              find.id = apiKeyId;

              find.name = name;
              find.key = key;
              find.hash = faker.string.alphanumeric(10);
              find.isActive = true;
              find.type = type;

              if (startDate && endDate) {
                find.startDate = startDate;
                find.endDate = endDate;
              }
              return find;
            }),
            getTotal: jest.fn().mockResolvedValue(10),
            softDelete: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    apiKeyService = module.get<ApiKeyService>(ApiKeyService);
    apiKeyRepository = module.get<ApiKeyRepository>(ApiKeyRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findOneByActiveKey", () => {
    it("should return api-keyEntity when findOne", async () => {
      const apiKey = await apiKeyService.findOneByActiveKey("abc");

      expect(apiKey instanceof ApiKeyEntity).toBeTruthy();
      expect(apiKey).toBeDefined();
      expect(apiKeyRepository.findOne).toBeCalledWith({ key: "abc", isActive: true }, undefined);
    });
  });

  describe("createHashApiKey", () => {
    it("should create string hash apikey", async () => {
      const key = faker.string.alphanumeric(10);
      const secret = faker.string.alphanumeric(10);

      const result = await apiKeyService.createHashApiKey(key, secret);

      expect(typeof result).toBe("string");
      expect(result).toBeDefined();
    });
  });

  describe("findOneById", () => {
    it("should return apiKey", async () => {
      const id = 1;
      const result = await apiKeyService.findOneById(id);

      expect(result).toBeDefined();
      expect(result.id).toBe(id);
      expect(result instanceof ApiKeyEntity).toBeTruthy();
      expect(apiKeyRepository.findOneById).toBeCalled();
    });
  });

  describe("findAll", () => {
    it("should return apiKeys", async () => {
      const result = await apiKeyService.findAll({ options: { withDeleted: true } });

      expect(apiKeyRepository.findAll).toBeCalled();
      expect(result).toHaveLength(2);
    });
    it("should return apiKey without withDeleted", async () => {
      const result = await apiKeyService.findAll();

      expect(apiKeyRepository.findAll).toBeCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe("deleteAll", () => {
    it("should return true when deleteAll successful", async () => {
      const result = await apiKeyService.deleteAll();

      expect(result).toBeTruthy();
    });
    it("should return false when deleteAll unsuccess", async () => {
      jest.spyOn(apiKeyRepository, "deleteAll").mockResolvedValue(false);
      const result = await apiKeyService.deleteAll();

      expect(result).toBeFalsy();
    });
  });

  describe("createRaw", () => {
    const dto = {
      name: "Api Key Public Test",
      type: ENUM_API_KEY_TYPE.PUBLIC,
      key: faker.string.alphanumeric(10),
      secret: faker.string.alphanumeric(10),
    };
    it("should return ApiKeyEntity when createRaw", async () => {
      const result = await apiKeyService.createRaw(dto);

      expect(result.doc instanceof ApiKeyEntity).toBeTruthy();
      expect(result.doc).toBeDefined();
      expect(result.secret).toBeDefined();
    });
  });

  describe("getTotal", () => {
    it("should return number", async () => {
      const result = await apiKeyService.getTotal();

      expect(result).toBe(10);
      expect(apiKeyRepository.getTotal).toBeCalledWith(undefined);
    });
  });

  describe("createKey", () => {
    it("should return key", async () => {
      const apiKey = await apiKeyService.createKey();

      expect(apiKey).toHaveLength(25);
      expect(apiKey).toMatch(/_/);
      expect(typeof apiKey).toBe("string");
    });
  });

  describe("createSecret", () => {
    it("should return secret key", async () => {
      const secretKey = await apiKeyService.createSecret();

      expect(secretKey).toHaveLength(35);
      expect(typeof secretKey).toBe("string");
    });
  });

  describe("create", () => {
    it("should return doc and secret when create api-key", async () => {
      const name = faker.word.words();
      const apiKey = await apiKeyService.create({
        name,
        type: ENUM_API_KEY_TYPE.PUBLIC,
      });

      expect(apiKey.doc).toBeDefined();
      expect(apiKey.doc instanceof ApiKeyEntity).toBeTruthy();
      expect(apiKey.secret).toBeDefined();
      expect(typeof apiKey.secret).toBe("string");
    });
  });

  describe("reset", () => {
    it("should reset api0key hash", async () => {
      const secret = faker.string.alphanumeric(5);
      const result = await apiKeyService.reset(new ApiKeyEntity(), secret);

      expect(result).toBeDefined();
      expect(apiKeyRepository.save).toBeCalled();
    });
  });

  describe("active", () => {
    it("should return isActive true", async () => {
      const result = await apiKeyService.active(new ApiKeyEntity());

      expect(result).toBeDefined();
      expect(result.isActive).toBeTruthy();
      expect(apiKeyRepository.save).toBeCalled();
    });
  });

  describe("inActive", () => {
    it("should return isActive false", async () => {
      jest
        .spyOn(apiKeyRepository, "save")
        .mockResolvedValue({ ...new ApiKeyEntity(), isActive: false });
      const result = await apiKeyService.inActive(new ApiKeyEntity());

      expect(result).toBeDefined();
      expect(result.isActive).toBeFalsy();
      expect(apiKeyRepository.save).toBeCalled();
    });
  });

  describe("softDelete", () => {
    it("should return true when softDelete role", async () => {
      const result = await apiKeyService.sofDelete(1);

      expect(result).toBeTruthy();
      expect(apiKeyRepository.softDelete).toBeCalledTimes(1);
    });
  });

  describe("updateDate", () => {
    it("should return apiKeyDoc when new startDate and endDate", async () => {
      const startDate = faker.date.recent();
      const endDate = faker.date.future({ years: 1 });

      const result = await apiKeyService.updateDate(new ApiKeyEntity(), { startDate, endDate });
      expect(result).toBeDefined();
      expect(result.startDate instanceof Date).toBeTruthy();
      expect(result.endDate instanceof Date).toBeTruthy();
      expect(apiKeyRepository.save).toBeCalled();
    });
  });

  describe("updateName", () => {
    it("should updateName", async () => {
      const result = await apiKeyService.updateName(new ApiKeyEntity(), "abc 123");

      expect(result.name).toBe("abc 123");
      expect(apiKeyRepository.save).toBeCalled();
    });
  });
});
