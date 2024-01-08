import { faker } from "@faker-js/faker";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app/app.module";
import { ENUM_API_KEY_STATUS_CODE_ERROR } from "src/common/api-key/constants/api-key.status-code.constant";
import { ENUM_AUTH_STATUS_CODE_ERROR } from "src/common/auth/constants/auth.status-code.constant";
import { ENUM_REQUEST_STATUS_CODE_ERROR } from "src/common/request/constants/request.status-code.constant";
import { ENUM_ROLE_TYPE } from "src/modules/role/constants/role.enum.constant";
import { ENUM_ROLE_STATUS_CODE_ERROR } from "src/modules/role/constants/role.status-code.constant";
import { RoleCreateDto } from "src/modules/role/dtos/role.create.dto";
import { RoleService } from "src/modules/role/services/role.service";
import { UserService } from "src/modules/user/services/user.service";
import request from "supertest";
import { UserEntity } from "src/modules/user/repository/entities/user.entity";
import { AuthService } from "src/common/auth/services/auth.service";
import { ApiKeyService } from "src/common/api-key/services/api-key.service";
import { RoleEntity } from "src/modules/role/repository/entities/role.entity";
import { UserFaker } from "test/helpers/user.faker";
import { ApiKeyFaker } from "test/helpers/api-key.faker";
import { AuthFaker } from "test/helpers/auth.faker";
import { RoleFaker } from "test/helpers/role.faker";

describe("role create e2e", () => {
  const CREATE_URL = "/admin/role/create";
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

  describe(`POST ${CREATE_URL}`, () => {
    it("should return 401 when not add x-api-key", async () => {
      const { body, status } = await request(app.getHttpServer())
        .post(`${CREATE_URL}`)
        .set("Authorization", `Bearer ${userAccessToken}`);

      expect(status).toBe(401);
      expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_NEEDED_ERROR);
    });
    it("should return 401 when not auth", async () => {
      const { body, status } = await request(app.getHttpServer())
        .post(`${CREATE_URL}`)
        .set("x-api-key", xApiKey);

      expect(status).toBe(401);
      expect(body.statusCode).toBe(ENUM_AUTH_STATUS_CODE_ERROR.AUTH_JWT_ACCESS_TOKEN_ERROR);
    });
    it("should return 403 when not role admin or superAdmin", async () => {
      const { body, status } = await request(app.getHttpServer())
        .post(`${CREATE_URL}`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userAccessToken}`);

      expect(status).toBe(403);
      expect(body.statusCode).toBe(ENUM_ROLE_STATUS_CODE_ERROR.ROLE_PAYLOAD_TYPE_INVALID_ERROR);
    });
    it("should return 422 when empty body", async () => {
      const { body, status } = await request(app.getHttpServer())
        .post(`${CREATE_URL}`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(422);
      expect(body.statusCode).toBe(ENUM_REQUEST_STATUS_CODE_ERROR.REQUEST_VALIDATION_ERROR);
    });
    it("should return 400 when role exist", async () => {
      const roleCreateDto: RoleCreateDto = {
        name: roleUser.name,
        type: ENUM_ROLE_TYPE.USER,
        permissions: [],
      };
      const { body, status } = await request(app.getHttpServer())
        .post(`${CREATE_URL}`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(roleCreateDto);

      expect(status).toBe(400);
      expect(body.statusCode).toBe(ENUM_ROLE_STATUS_CODE_ERROR.ROLE_EXIST_ERROR);
    });
    it("should return 201 when create role successful", async () => {
      const roleCreateDto: RoleCreateDto = {
        name: faker.word.words(2),
        description: faker.lorem.sentence(),
        type: ENUM_ROLE_TYPE.USER,
        permissions: [],
      };
      const { body, status } = await request(app.getHttpServer())
        .post(`${CREATE_URL}`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(roleCreateDto);

      expect(status).toBe(201);
      expect(body.statusCode).toBeDefined();
      expect(body.data.id).toBeDefined();
    });
  });
});
