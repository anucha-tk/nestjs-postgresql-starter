import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app/app.module";
import { ApiKeyService } from "src/common/api-key/services/api-key.service";
import { RoleService } from "src/modules/role/services/role.service";
import { UserService } from "src/modules/user/services/user.service";
import request from "supertest";
import { faker } from "@faker-js/faker";
import { ENUM_API_KEY_STATUS_CODE_ERROR } from "src/common/api-key/constants/api-key.status-code.constant";
import { useContainer } from "class-validator";
import { UserEntity } from "src/modules/user/repository/entities/user.entity";
import { ApiKeyEntity } from "src/common/api-key/repository/entities/api-key.entity";
import { AuthService } from "src/common/auth/services/auth.service";
import { UserFaker } from "test/helpers/user.faker";
import { ApiKeyFaker } from "test/helpers/api-key.faker";
import { AuthFaker } from "test/helpers/auth.faker";

describe("api-key reset e2e", () => {
  const BASE_URL = "/admin/api-key";
  const APIKEY_UPDATE_URL = `${BASE_URL}/update`;
  let app: INestApplication;
  let userService: UserService;
  let roleService: RoleService;
  let apiKeyService: ApiKeyService;
  let admin: UserEntity;
  let authService: AuthService;
  let xApiKey: string;
  let adminAccessToken: string;
  let apiKey: ApiKeyEntity;

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
    apiKey = apiKeyCreate.doc;

    xApiKey = apiKeyFaker.getXApiKey(apiKeyCreate);

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

  describe(`Patch ${APIKEY_UPDATE_URL}/:apiKey/reset`, () => {
    it("should throw 404 when not found apiKey", async () => {
      const apiKeyId = faker.number.int({ min: 1000, max: 2000 });
      const { body, status } = await request(app.getHttpServer())
        .patch(`${APIKEY_UPDATE_URL}/${apiKeyId}/reset`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(404);
      expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_NOT_FOUND_ERROR);
    });
    it("should throw 400 when apiKey not active", async () => {
      jest.spyOn(apiKeyService, "findOneById").mockResolvedValue({
        id: apiKey.id,
        isActive: false,
      } as ApiKeyEntity);
      const apiKeyId = apiKey.id;
      const { body, status } = await request(app.getHttpServer())
        .patch(`${APIKEY_UPDATE_URL}/${apiKeyId}/reset`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(400);
      expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_IS_ACTIVE_ERROR);
    });
    it("should throw 400 when apiKey is expired", async () => {
      jest.spyOn(apiKeyService, "findOneById").mockResolvedValue({
        id: apiKey.id,
        isActive: true,
        startDate: faker.date.recent(),
        endDate: faker.date.past(),
      } as ApiKeyEntity);
      const apiKeyId = apiKey.id;
      const { body, status } = await request(app.getHttpServer())
        .patch(`${APIKEY_UPDATE_URL}/${apiKeyId}/reset`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(400);
      expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_EXPIRED_ERROR);
    });
    it("should return 200 when reset successful", async () => {
      jest.restoreAllMocks();
      const apiKeyId = apiKey.id;
      const { body, status } = await request(app.getHttpServer())
        .patch(`${APIKEY_UPDATE_URL}/${apiKeyId}/reset`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(200);
      expect(body).toBeDefined();
    });
  });
});
