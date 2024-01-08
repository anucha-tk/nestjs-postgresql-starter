import { faker } from "@faker-js/faker";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app/app.module";
import { ENUM_API_KEY_STATUS_CODE_ERROR } from "src/common/api-key/constants/api-key.status-code.constant";
import { ApiKeyService } from "src/common/api-key/services/api-key.service";
import { AuthService } from "src/common/auth/services/auth.service";
import { ENUM_ROLE_STATUS_CODE_ERROR } from "src/modules/role/constants/role.status-code.constant";
import { RoleEntity } from "src/modules/role/repository/entities/role.entity";
import { RoleService } from "src/modules/role/services/role.service";
import { UserEntity } from "src/modules/user/repository/entities/user.entity";
import { UserService } from "src/modules/user/services/user.service";
import request from "supertest";
import { ApiKeyFaker } from "test/helpers/api-key.faker";
import { AuthFaker } from "test/helpers/auth.faker";
import { RoleFaker } from "test/helpers/role.faker";
import { UserFaker } from "test/helpers/user.faker";

describe("role get e2e", () => {
  const GET_URL = "/admin/role/get";
  let app: INestApplication;
  let userService: UserService;
  let roleService: RoleService;
  let apiKeyService: ApiKeyService;
  let authService: AuthService;
  let user: UserEntity;
  let admin: UserEntity;
  let userAccessToken: string;
  let adminAccessToken: string;
  let xApiKey: string;
  let roleUser: RoleEntity;

  beforeAll(async () => {
    const modRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modRef.createNestApplication();
    userService = app.get(UserService);
    roleService = app.get(RoleService);
    apiKeyService = app.get(ApiKeyService);
    authService = app.get(AuthService);
    await app.init();

    const userFaker = new UserFaker(authService, userService, roleService);
    const apiKeyFaker = new ApiKeyFaker(apiKeyService);
    const authFaker = new AuthFaker(app);
    const roleFaker = new RoleFaker(roleService);

    user = await userFaker.createUser({});
    admin = await userFaker.createAdmin({});
    const password = await userFaker.getPassword();
    roleUser = await roleFaker.createRoleUser({ name: "user" });

    const apiKey = await apiKeyFaker.createApiKey({});
    xApiKey = apiKeyFaker.getXApiKey(apiKey);

    userAccessToken = await authFaker.login({ email: user.email, password, xApiKey });
    adminAccessToken = await authFaker.login({ email: admin.email, password, xApiKey });
  });

  afterAll(async () => {
    await userService.deleteAll();
    await roleService.deleteAll();
    await apiKeyService.deleteAll();
    jest.clearAllMocks();
    await app.close();
  });

  describe(`Get ${GET_URL}/:role`, () => {
    it("should return 401 when not add x-api-key", async () => {
      const { body, status } = await request(app.getHttpServer())
        .get(`${GET_URL}/${roleUser.id}`)
        .set("Authorization", `Bearer ${userAccessToken}`);
      expect(status).toBe(401);
      expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_NEEDED_ERROR);
    });
    it("should return 403 when not admin or superAdmin", async () => {
      const { body, status } = await request(app.getHttpServer())
        .get(`${GET_URL}/${roleUser.id}`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userAccessToken}`);
      expect(status).toBe(403);
      expect(body.statusCode).toBe(ENUM_ROLE_STATUS_CODE_ERROR.ROLE_PAYLOAD_TYPE_INVALID_ERROR);
    });
    it("should return 404 when role not found", async () => {
      const { body, status } = await request(app.getHttpServer())
        .get(`${GET_URL}/${faker.number.int({ min: 10, max: 100 })}`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(404);
      expect(body.statusCode).toBe(ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR);
    });
    it("should return 200 when get role successful", async () => {
      const { body, status } = await request(app.getHttpServer())
        .get(`${GET_URL}/${roleUser.id}`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(200);
      expect(body.statusCode).toBeDefined();
      expect(body.data.id).toBeDefined();
    });
  });
});
