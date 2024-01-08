import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app/app.module";
import { ApiKeyService } from "src/common/api-key/services/api-key.service";
import { RoleService } from "src/modules/role/services/role.service";
import { UserService } from "src/modules/user/services/user.service";
import request from "supertest";
import { useContainer } from "class-validator";
import { ENUM_API_KEY_STATUS_CODE_ERROR } from "src/common/api-key/constants/api-key.status-code.constant";
import { faker } from "@faker-js/faker";
import { UserEntity } from "src/modules/user/repository/entities/user.entity";
import { ApiKeyEntity } from "src/common/api-key/repository/entities/api-key.entity";
import { AuthService } from "src/common/auth/services/auth.service";
import { UserFaker } from "test/helpers/user.faker";
import { ApiKeyFaker } from "test/helpers/api-key.faker";
import { AuthFaker } from "test/helpers/auth.faker";

describe("api-key get e2e", () => {
  const APIKEY_GET_URL = "/admin/api-key/get";
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

  afterAll(async () => {
    jest.clearAllMocks();
    await userService.deleteAll();
    await roleService.deleteAll();
    await apiKeyService.deleteAll();
    await app.close();
  });

  describe(`Get ${APIKEY_GET_URL}`, () => {
    it("should throw 404 when apiKey is not found", async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`${APIKEY_GET_URL}/${faker.number.int({ min: 1000, max: 2000 })}`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(404);
      expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_NOT_FOUND_ERROR);
    });
    it("should return apikey", async () => {
      const { body, status } = await request(app.getHttpServer())
        .get(`${APIKEY_GET_URL}/${apiKey.id}`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(200);
      expect(body.data).toBeDefined();
    });
  });
});
