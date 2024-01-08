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
import { ENUM_POLICY_STATUS_CODE_ERROR } from "src/common/policy/constants/policy.status-code.constant";
import { ENUM_ROLE_STATUS_CODE_ERROR } from "src/modules/role/constants/role.status-code.constant";

describe("api-key softDelete e2e", () => {
  const APIKEY_DELETE_URL = `/admin/api-key/delete`;
  let app: INestApplication;
  let userService: UserService;
  let roleService: RoleService;
  let apiKeyService: ApiKeyService;
  let user: UserEntity;
  let admin: UserEntity;
  let adminNotPolicy: UserEntity;
  let authService: AuthService;
  let xApiKey: string;
  let xApiKeyTwo: string;
  let adminAccessToken: string;
  let userAccessToken: string;
  let apiKey: ApiKeyEntity;
  let apiKeyTwo: ApiKeyEntity;
  let password: string;

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
    user = await userFaker.createUser({});
    admin = await userFaker.createAdmin({});
    adminNotPolicy = await userFaker.createAdmin({ permissions: [] });
    password = await userFaker.getPassword();

    const apiKeyCreate = await apiKeyFaker.createApiKey({});
    const apiKeyTwoCreate = await apiKeyFaker.createApiKey({});
    apiKey = apiKeyCreate.doc;
    apiKeyTwo = apiKeyTwoCreate.doc;

    xApiKey = apiKeyFaker.getXApiKey(apiKeyCreate);
    xApiKeyTwo = apiKeyFaker.getXApiKey(apiKeyTwoCreate);

    userAccessToken = await authFaker.login({ email: user.email, password, xApiKey });
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

  describe(`DELETE ${APIKEY_DELETE_URL}`, () => {
    it("should return 403 when type role not include SUPER_ADMIN or ADMIN", async () => {
      const { body, status } = await request(app.getHttpServer())
        .delete(`${APIKEY_DELETE_URL}/${apiKeyTwo.id}`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userAccessToken}`);

      expect(status).toBe(403);
      expect(body.statusCode).toBe(ENUM_ROLE_STATUS_CODE_ERROR.ROLE_PAYLOAD_TYPE_INVALID_ERROR);
    });
    it("should return 403 when policy not allow", async () => {
      const adminRes = await request(app.getHttpServer())
        .post("/public/user/login")
        .send({ email: adminNotPolicy.email, password: password })
        .set("x-api-key", xApiKey);

      const { body, status } = await request(app.getHttpServer())
        .delete(`${APIKEY_DELETE_URL}/${apiKeyTwo.id}`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminRes.body.data.accessToken}`);

      expect(status).toBe(403);
      expect(body.statusCode).toBe(ENUM_POLICY_STATUS_CODE_ERROR.POLICY_ABILITY_FORBIDDEN_ERROR);
    });

    it("should throw 404 when apiKey not found", async () => {
      const { body, status } = await request(app.getHttpServer())
        .delete(`${APIKEY_DELETE_URL}/${faker.number.int({ min: 1000, max: 2000 })}`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(404);
      expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_NOT_FOUND_ERROR);
    });

    it("should return 200 when admin delete apikey successful", async () => {
      const { status } = await request(app.getHttpServer())
        .delete(`${APIKEY_DELETE_URL}/${apiKeyTwo.id}`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(200);
    });

    it("should throw 403 when use apiKey deleted", async () => {
      const { status, body } = await request(app.getHttpServer())
        .delete(`${APIKEY_DELETE_URL}/${apiKey.id}`)
        .set("x-api-key", xApiKeyTwo)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(403);
      expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_NOT_FOUND_ERROR);
    });
  });
});
