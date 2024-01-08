import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app/app.module";
import { ApiKeyService } from "src/common/api-key/services/api-key.service";
import { RoleService } from "src/modules/role/services/role.service";
import { UserEntity } from "src/modules/user/repository/entities/user.entity";
import { UserService } from "src/modules/user/services/user.service";
import request from "supertest";
import { ApiKeyEntity } from "src/common/api-key/repository/entities/api-key.entity";
import { faker } from "@faker-js/faker";
import { ENUM_API_KEY_STATUS_CODE_ERROR } from "src/common/api-key/constants/api-key.status-code.constant";
import { useContainer } from "class-validator";
import { AuthService } from "src/common/auth/services/auth.service";
import { UserFaker } from "test/helpers/user.faker";
import { ApiKeyFaker } from "test/helpers/api-key.faker";
import { AuthFaker } from "test/helpers/auth.faker";

describe("api-key active e2e", () => {
  const APIKEY_UPDATE_URL = `/admin/api-key/update`;
  let app: INestApplication;
  let userService: UserService;
  let roleService: RoleService;
  let apiKeyService: ApiKeyService;
  let admin: UserEntity;
  let authService: AuthService;
  let xApiKey: string;
  let xApiKeyTwo: string;
  let adminAccessToken: string;
  let apiKey: ApiKeyEntity;
  let apiKeyTwo: ApiKeyEntity;

  beforeAll(async () => {
    const modRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modRef.createNestApplication();
    userService = modRef.get<UserService>(UserService);
    roleService = modRef.get<RoleService>(RoleService);
    apiKeyService = modRef.get<ApiKeyService>(ApiKeyService);
    authService = modRef.get<AuthService>(AuthService);
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    await app.init();

    const userFaker = new UserFaker(authService, userService, roleService);
    const apiKeyFaker = new ApiKeyFaker(apiKeyService);
    const authFaker = new AuthFaker(app);
    admin = await userFaker.createAdmin({});
    const password = await userFaker.getPassword();

    const apiKeyCreate = await apiKeyFaker.createApiKey({});
    const apiKeyTwoCreate = await apiKeyFaker.createApiKey({});
    apiKey = apiKeyCreate.doc;
    apiKeyTwo = apiKeyTwoCreate.doc;

    xApiKey = apiKeyFaker.getXApiKey(apiKeyCreate);
    xApiKeyTwo = apiKeyFaker.getXApiKey(apiKeyTwoCreate);

    adminAccessToken = await authFaker.login({ email: admin.email, password, xApiKey });
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    jest.clearAllMocks();
    await userService.deleteAll();
    await roleService.deleteAll();
    await apiKeyService.deleteAll();
    await app.close();
  });

  describe(`Patch ${APIKEY_UPDATE_URL}/:apiKey/active`, () => {
    it("should return 404 when apikey not found", async () => {
      const apiKeyId = faker.number.int({ min: 1000, max: 2000 });
      const { body, status } = await request(app.getHttpServer())
        .patch(`${APIKEY_UPDATE_URL}/${apiKeyId}/active`)
        .set("x-api-key", xApiKeyTwo)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(404);
      expect(body).toBeDefined();
      expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_NOT_FOUND_ERROR);
    });
    it("should return 400 when apikey active", async () => {
      const apiKeyId = apiKeyTwo.id;
      const { body, status } = await request(app.getHttpServer())
        .patch(`${APIKEY_UPDATE_URL}/${apiKeyId}/active`)
        .set("x-api-key", xApiKeyTwo)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(400);
      expect(body).toBeDefined();
      expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_IS_ACTIVE_ERROR);
    });
    it("should return 400 when apikey expired", async () => {
      jest.spyOn(apiKeyService, "findOneById").mockResolvedValue({
        id: apiKeyTwo.id,
        isActive: false,
        startDate: faker.date.recent(),
        endDate: faker.date.past(),
      } as ApiKeyEntity);
      const apiKeyId = apiKeyTwo.id;
      const { body, status } = await request(app.getHttpServer())
        .patch(`${APIKEY_UPDATE_URL}/${apiKeyId}/active`)
        .set("x-api-key", xApiKeyTwo)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(400);
      expect(body).toBeDefined();
      expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_EXPIRED_ERROR);
    });
    it("should return 200 when active api successful", async () => {
      const apiKeyId = apiKey.id;
      await request(app.getHttpServer())
        .patch(`${APIKEY_UPDATE_URL}/${apiKeyId}/inactive`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      const { body, status } = await request(app.getHttpServer())
        .patch(`${APIKEY_UPDATE_URL}/${apiKeyId}/active`)
        .set("x-api-key", xApiKeyTwo)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(200);
      expect(body).toBeDefined();
    });
  });
});
