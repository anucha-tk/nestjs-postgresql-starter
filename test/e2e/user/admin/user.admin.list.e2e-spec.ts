import { faker } from "@faker-js/faker";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app/app.module";
import { ENUM_API_KEY_STATUS_CODE_ERROR } from "src/common/api-key/constants/api-key.status-code.constant";
import { ApiKeyService } from "src/common/api-key/services/api-key.service";
import { ENUM_AUTH_STATUS_CODE_ERROR } from "src/common/auth/constants/auth.status-code.constant";
import { AuthService } from "src/common/auth/services/auth.service";
import { ENUM_POLICY_STATUS_CODE_ERROR } from "src/common/policy/constants/policy.status-code.constant";
import { ENUM_ROLE_STATUS_CODE_ERROR } from "src/modules/role/constants/role.status-code.constant";
import { RoleService } from "src/modules/role/services/role.service";
import { UserEntity } from "src/modules/user/repository/entities/user.entity";
import { UserService } from "src/modules/user/services/user.service";
import request from "supertest";
import { ApiKeyFaker } from "test/helpers/api-key.faker";
import { AuthFaker } from "test/helpers/auth.faker";
import { UserFaker } from "test/helpers/user.faker";

describe("user admin e2e", () => {
  const USER_LIST_URL = "/admin/user/list";
  let app: INestApplication;
  let userService: UserService;
  let roleService: RoleService;
  let apiKeyService: ApiKeyService;
  let xApiKey: string;
  let userAccessToken: string;
  let adminAccessToken: string;
  let adminUnPolicyAccessToken: string;
  let user: UserEntity;
  let admin: UserEntity;

  beforeAll(async () => {
    const modRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modRef.createNestApplication();
    userService = modRef.get<UserService>(UserService);
    roleService = modRef.get<RoleService>(RoleService);
    apiKeyService = modRef.get<ApiKeyService>(ApiKeyService);
    const authService = modRef.get(AuthService);
    await app.init();

    const userFaker = new UserFaker(authService, userService, roleService);
    const apiKeyFaker = new ApiKeyFaker(apiKeyService);
    const authFaker = new AuthFaker(app);

    const apiKey = await apiKeyFaker.createApiKey({});
    xApiKey = apiKeyFaker.getXApiKey(apiKey);

    // create user
    admin = await userFaker.createAdmin({});
    const adminUnPolicy = await userFaker.createAdmin({ permissions: [] });
    user = await userFaker.createUser({});
    await Promise.all([userFaker.createSuperAdmin({}), userFaker.createUser({ deleted: true })]);

    // login by user
    const loginResponse = await Promise.all([
      authFaker.login({ email: admin.email, xApiKey }),
      authFaker.login({ email: adminUnPolicy.email, xApiKey }),
      authFaker.login({ email: user.email, xApiKey }),
    ]);

    // get accessToken
    adminAccessToken = loginResponse[0];
    adminUnPolicyAccessToken = loginResponse[1];
    userAccessToken = loginResponse[2];
  });

  afterAll(async () => {
    jest.clearAllMocks();
    await userService.deleteAll();
    await roleService.deleteAll();
    await apiKeyService.deleteAll();
    await app.close();
  });

  describe("x-api-key", () => {
    it("should return 401 when not send x-api-key", async () => {
      const { status, body } = await request(app.getHttpServer()).get(USER_LIST_URL);

      expect(status).toBe(401);
      expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_NEEDED_ERROR);
    });
  });
  describe("auth", () => {
    it("should return 401 when not auth", async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(USER_LIST_URL)
        .set("x-api-key", xApiKey);

      expect(status).toBe(401);
      expect(body.statusCode).toBe(ENUM_AUTH_STATUS_CODE_ERROR.AUTH_JWT_ACCESS_TOKEN_ERROR);
    });
    it("should return 403 when not admin or superAdmin", async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(USER_LIST_URL)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userAccessToken}`);

      expect(status).toBe(403);
      expect(body.statusCode).toBe(ENUM_ROLE_STATUS_CODE_ERROR.ROLE_PAYLOAD_TYPE_INVALID_ERROR);
    });
    it("should return 403 when not admin not have user policy", async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(USER_LIST_URL)
        .set("x-api-key", xApiKey)
        .set("authorization", `Bearer ${adminUnPolicyAccessToken}`);

      expect(status).toBe(403);
      expect(body.statusCode).toBe(ENUM_POLICY_STATUS_CODE_ERROR.POLICY_ABILITY_FORBIDDEN_ERROR);
    });
  });
  describe("query", () => {
    beforeEach(async () => {
      const modRef: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = modRef.createNestApplication();
      await app.init();
    });
    it("should return 200 when query username", async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`${USER_LIST_URL}?search=${faker.word.words()}`)
        .set("x-api-key", xApiKey)
        .set("authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(200);
      expect(body._metadata.pagination).toBeDefined();
      expect(body.data).toBeInstanceOf(Array);
    });
    it("should return 200 when list success", async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(USER_LIST_URL)
        .set("x-api-key", xApiKey)
        .set("authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(200);
      expect(body._metadata.pagination).toBeDefined();
      expect(body.data).toBeInstanceOf(Array);
    });
  });
});
