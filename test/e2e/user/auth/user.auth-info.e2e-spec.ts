import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app/app.module";
import { RoleService } from "src/modules/role/services/role.service";
import { UserService } from "src/modules/user/services/user.service";
import { ENUM_AUTH_STATUS_CODE_ERROR } from "src/common/auth/constants/auth.status-code.constant";
import { ENUM_API_KEY_STATUS_CODE_ERROR } from "src/common/api-key/constants/api-key.status-code.constant";
import { ApiKeyService } from "src/common/api-key/services/api-key.service";
import { UserFaker } from "test/helpers/user.faker";
import { ApiKeyFaker } from "test/helpers/api-key.faker";
import { AuthFaker } from "test/helpers/auth.faker";
import { UserEntity } from "src/modules/user/repository/entities/user.entity";
import { AuthService } from "src/common/auth/services/auth.service";

describe("user info e2e", () => {
  const USER_INFO_URL = "/auth/user/info";
  let app: INestApplication;
  let userService: UserService;
  let user: UserEntity;
  let roleService: RoleService;
  let apiKeyService: ApiKeyService;
  let xApiKey: string;
  let userAccessToken: string;

  beforeAll(async () => {
    const modRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modRef.createNestApplication();
    userService = modRef.get<UserService>(UserService);
    roleService = modRef.get<RoleService>(RoleService);
    apiKeyService = modRef.get<ApiKeyService>(ApiKeyService);
    const authService = modRef.get<AuthService>(AuthService);
    await app.init();

    const userFaker = new UserFaker(authService, userService, roleService);
    const apiKeyFaker = new ApiKeyFaker(apiKeyService);
    const authFaker = new AuthFaker(app);

    user = await userFaker.createUser({});
    const password = await userFaker.getPassword();

    const apiKey = await apiKeyFaker.createApiKey({});
    xApiKey = apiKeyFaker.getXApiKey(apiKey);

    userAccessToken = await authFaker.login({ email: user.email, password, xApiKey });
  });

  afterAll(async () => {
    jest.clearAllMocks();
    await userService.deleteAll();
    await roleService.deleteAll();
    await apiKeyService.deleteAll();
    await app.close();
  });

  describe(`GET ${USER_INFO_URL}`, () => {
    describe("x-api-key", () => {
      it("should return 401 when not send x-api-key", async () => {
        const { status, body } = await request(app.getHttpServer()).get(USER_INFO_URL);

        expect(status).toBe(401);
        expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_NEEDED_ERROR);
      });
    });
    describe("auth", () => {
      it("should return 401 when not auth", async () => {
        const { status, body } = await request(app.getHttpServer())
          .get(USER_INFO_URL)
          .set("x-api-key", xApiKey);

        expect(status).toBe(401);
        expect(body.statusCode).toBe(ENUM_AUTH_STATUS_CODE_ERROR.AUTH_JWT_ACCESS_TOKEN_ERROR);
      });
    });
    describe("user response", () => {
      it("should return 200 and user info when successful", async () => {
        const { status, body } = await request(app.getHttpServer())
          .get(USER_INFO_URL)
          .set("x-api-key", xApiKey)
          .set("Authorization", `Bearer ${userAccessToken}`);

        expect(status).toBe(200);
        expect(body.data).toBeDefined();
        expect(body.data).toHaveProperty("id");
        expect(body.data).toHaveProperty("firstName");
        expect(body.data).toHaveProperty("lastName");
        expect(body.data).toHaveProperty("email");
        expect(body.data).toHaveProperty("type");
        expect(body.data).toHaveProperty("role");
        expect(body.data).toHaveProperty("permissions");
      });
    });
  });
});
