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
import { ENUM_ROLE_STATUS_CODE_ERROR } from "src/modules/role/constants/role.status-code.constant";
import { ENUM_POLICY_STATUS_CODE_ERROR } from "src/common/policy/constants/policy.status-code.constant";

describe("api-key update-date e2e", () => {
  const APIKEY_UPDATE_URL = `/admin/api-key/update`;
  let app: INestApplication;
  let userService: UserService;
  let roleService: RoleService;
  let apiKeyService: ApiKeyService;
  let user: UserEntity;
  let admin: UserEntity;
  let adminNotPublic: UserEntity;
  let authService: AuthService;
  let xApiKey: string;
  let userAccessToken: string;
  let adminAccessToken: string;
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
    adminNotPublic = await userFaker.createAdmin({ permissions: [] });
    password = await userFaker.getPassword();

    const apiKeyCreate = await apiKeyFaker.createApiKey({});
    const apiKeyTwoCreate = await apiKeyFaker.createApiKey({});
    apiKey = apiKeyCreate.doc;
    apiKeyTwo = apiKeyTwoCreate.doc;

    xApiKey = apiKeyFaker.getXApiKey(apiKeyCreate);

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

  describe(`PUT ${APIKEY_UPDATE_URL}/:apiKey/date`, () => {
    it("should return 403 when type role not include SUPER_ADMIN or ADMIN", async () => {
      const { body, status } = await request(app.getHttpServer())
        .put(`${APIKEY_UPDATE_URL}/${apiKeyTwo.id}/date`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userAccessToken}`);

      expect(status).toBe(403);
      expect(body.statusCode).toBe(ENUM_ROLE_STATUS_CODE_ERROR.ROLE_PAYLOAD_TYPE_INVALID_ERROR);
    });
    it("should return 403 when policy not allow", async () => {
      const adminRes = await request(app.getHttpServer())
        .post("/public/user/login")
        .send({ email: adminNotPublic.email, password: password })
        .set("x-api-key", xApiKey);

      const { body, status } = await request(app.getHttpServer())
        .put(`${APIKEY_UPDATE_URL}/${apiKeyTwo.id}/date`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminRes.body.data.accessToken}`);

      expect(status).toBe(403);
      expect(body.statusCode).toBe(ENUM_POLICY_STATUS_CODE_ERROR.POLICY_ABILITY_FORBIDDEN_ERROR);
    });

    it("should throw 404 when apiKey not found", async () => {
      const { body, status } = await request(app.getHttpServer())
        .put(`${APIKEY_UPDATE_URL}/${faker.number.int({ min: 1000, max: 2000 })}/date`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(404);
      expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_NOT_FOUND_ERROR);
    });
    it("should return 400 when apiKey not active", async () => {
      jest
        .spyOn(apiKeyService, "findOneById")
        .mockResolvedValue({ isActive: false } as ApiKeyEntity);
      const { body, status } = await request(app.getHttpServer())
        .put(`${APIKEY_UPDATE_URL}/${apiKey.id}/date`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(400);
      expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_IS_ACTIVE_ERROR);
    });
    it("should return 400 when apiKey expired", async () => {
      jest.spyOn(apiKeyService, "findOneById").mockResolvedValue({
        id: apiKey.id,
        isActive: true,
        startDate: faker.date.recent(),
        endDate: faker.date.past(),
      } as ApiKeyEntity);

      const { body, status } = await request(app.getHttpServer())
        .put(`${APIKEY_UPDATE_URL}/${apiKey.id}/date`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(400);
      expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_EXPIRED_ERROR);
    });
    it("should return 422 when empty body update date", async () => {
      const { status } = await request(app.getHttpServer())
        .put(`${APIKEY_UPDATE_URL}/${apiKey.id}/date`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(422);
    });
  });
  // WARN: e2e test is error when send body @IsDate() on dto throw error
  // but we test pass on postman
  it("should return 200 when update date successful", async () => {
    const currentDate = new Date();
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 3,
      currentDate.getDate(),
    );
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 6,
      currentDate.getDate(),
    );
    const { status, body } = await request(app.getHttpServer())
      .put(`${APIKEY_UPDATE_URL}/${apiKey.id}/date`)
      .set("x-api-key", xApiKey)
      .set("Authorization", `Bearer ${adminAccessToken}`)
      .send({
        startDate,
        endDate,
      });

    expect(body).toBeDefined();
    expect(status).toBe(200);
  });
});
