import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app/app.module";
import { RoleService } from "src/modules/role/services/role.service";
import { UserService } from "src/modules/user/services/user.service";
import request from "supertest";
import { ENUM_AUTH_STATUS_CODE_ERROR } from "src/common/auth/constants/auth.status-code.constant";
import { ENUM_ROLE_STATUS_CODE_ERROR } from "src/modules/role/constants/role.status-code.constant";
import { UserEntity } from "src/modules/user/repository/entities/user.entity";
import { UserFaker } from "test/helpers/user.faker";
import { RoleFaker } from "test/helpers/role.faker";
import { ApiKeyFaker } from "test/helpers/api-key.faker";
import { AuthService } from "src/common/auth/services/auth.service";
import { ApiKeyService } from "src/common/api-key/services/api-key.service";

describe("user auth e2e", () => {
  const USER_REFRESH_URL = "/auth/user/refresh";
  let app: INestApplication;
  let userService: UserService;
  let roleService: RoleService;
  let authService: AuthService;
  let apiKeyService: ApiKeyService;
  let user: UserEntity;
  let xApiKey: string;
  let userRefreshToken: string;

  beforeAll(async () => {
    const modRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modRef.createNestApplication();
    userService = modRef.get<UserService>(UserService);
    roleService = modRef.get<RoleService>(RoleService);
    authService = modRef.get<AuthService>(AuthService);
    apiKeyService = modRef.get<ApiKeyService>(ApiKeyService);
    await app.init();

    const userFaker = new UserFaker(authService, userService, roleService);
    const roleFaker = new RoleFaker(roleService);
    const apiKeyFaker = new ApiKeyFaker(apiKeyService);

    user = await userFaker.createUser({});
    const password = await userFaker.getPassword();
    await roleFaker.createRoleUser({ name: "user" });

    const apiKey = await apiKeyFaker.createApiKey({});
    xApiKey = apiKeyFaker.getXApiKey(apiKey);

    const resLogin = await request(app.getHttpServer())
      .post("/public/user/login")
      .send({ email: user.email, password })
      .set("x-api-key", xApiKey);

    userRefreshToken = resLogin.body.data.refreshToken;
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
  describe(`Post ${USER_REFRESH_URL}`, () => {
    it("should throw 401 when refreshToken on header not exist", async () => {
      const { body, status } = await request(app.getHttpServer())
        .post(`${USER_REFRESH_URL}`)
        .set("x-api-key", xApiKey);

      expect(body).toBeDefined();
      expect(status).toBe(401);
      expect(body.statusCode).toBe(ENUM_AUTH_STATUS_CODE_ERROR.AUTH_JWT_REFRESH_TOKEN_ERROR);
    });
    it("should throw 403 when role inactive", async () => {
      jest
        .spyOn(userService, "joinWithRole")
        .mockResolvedValue({ ...user, role: { isActive: false } } as UserEntity);
      const { body, status } = await request(app.getHttpServer())
        .post(`${USER_REFRESH_URL}`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userRefreshToken}`);

      expect(body).toBeDefined();
      expect(status).toBe(403);
      expect(body.statusCode).toBe(ENUM_ROLE_STATUS_CODE_ERROR.ROLE_INACTIVE_ERROR);
    });
    it("should IResponse accessToken and refreshToken when refresh successful", async () => {
      // NOTE: JWT.sign not sign new accessToken, i think because we login then refresh jwt sign return old accessToken
      // we test on postman is not problem, we receive new accessToken
      const { body, status } = await request(app.getHttpServer())
        .post(`${USER_REFRESH_URL}`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userRefreshToken}`);

      expect(body).toBeDefined();
      expect(status).toBe(200);
      expect(body.data).toHaveProperty("tokenType");
      expect(body.data).toHaveProperty("expiresIn");
      expect(body.data).toHaveProperty("accessToken");
      expect(body.data).toHaveProperty("refreshToken");
      expect(body.data.refreshToken).toEqual(userRefreshToken);
    });
  });
});
