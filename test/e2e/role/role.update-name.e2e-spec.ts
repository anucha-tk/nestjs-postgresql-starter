import { faker } from "@faker-js/faker";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app/app.module";
import { ENUM_API_KEY_STATUS_CODE_ERROR } from "src/common/api-key/constants/api-key.status-code.constant";
import { ApiKeyService } from "src/common/api-key/services/api-key.service";
import { ENUM_AUTH_STATUS_CODE_ERROR } from "src/common/auth/constants/auth.status-code.constant";
import { AuthService } from "src/common/auth/services/auth.service";
import { ENUM_POLICY_STATUS_CODE_ERROR } from "src/common/policy/constants/policy.status-code.constant";
import { ENUM_REQUEST_STATUS_CODE_ERROR } from "src/common/request/constants/request.status-code.constant";
import { ENUM_ROLE_TYPE } from "src/modules/role/constants/role.enum.constant";
import { ENUM_ROLE_STATUS_CODE_ERROR } from "src/modules/role/constants/role.status-code.constant";
import { RoleUpdateNameDto } from "src/modules/role/dtos/role.update-name.dto";
import { RoleEntity } from "src/modules/role/repository/entities/role.entity";
import { RoleService } from "src/modules/role/services/role.service";
import { UserEntity } from "src/modules/user/repository/entities/user.entity";
import { UserService } from "src/modules/user/services/user.service";
import request from "supertest";
import { ApiKeyFaker } from "test/helpers/api-key.faker";
import { AuthFaker } from "test/helpers/auth.faker";
import { RoleFaker } from "test/helpers/role.faker";
import { UserFaker } from "test/helpers/user.faker";

describe("role updateName e2e", () => {
  const UPDATE_URL = "/admin/role/update";
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
  let roleAdmin: RoleEntity;
  let password: string;

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
    password = await userFaker.getPassword();
    roleUser = await roleFaker.createRoleUser({ name: "user" });
    roleAdmin = await roleFaker.createRoleAdmin({ name: "admin" });

    const apiKey = await apiKeyFaker.createApiKey({});
    xApiKey = apiKeyFaker.getXApiKey(apiKey);

    userAccessToken = await authFaker.login({ email: user.email, password, xApiKey });
    adminAccessToken = await authFaker.login({ email: admin.email, password, xApiKey });
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await userService.deleteAll();
    await roleService.deleteAll();
    await apiKeyService.deleteAll();
    jest.clearAllMocks();
    await app.close();
  });

  describe(`PUT ${UPDATE_URL}`, () => {
    it("should return 401 when not send x-api-key", async () => {
      const { status, body } = await request(app.getHttpServer()).put(
        `${UPDATE_URL}/${roleUser.id}/name`,
      );
      expect(status).toBe(401);
      expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_NEEDED_ERROR);
    });
    it("should return 401 when not auth", async () => {
      const { status, body } = await request(app.getHttpServer())
        .put(`${UPDATE_URL}/${roleUser.id}/name`)
        .set("x-api-key", xApiKey);
      expect(status).toBe(401);
      expect(body.statusCode).toBe(ENUM_AUTH_STATUS_CODE_ERROR.AUTH_JWT_ACCESS_TOKEN_ERROR);
    });
    it("should return 403 when not admin or superAdmin", async () => {
      const { status, body } = await request(app.getHttpServer())
        .put(`${UPDATE_URL}/${roleUser.id}/name`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userAccessToken}`);
      expect(status).toBe(403);
      expect(body.statusCode).toBe(ENUM_ROLE_STATUS_CODE_ERROR.ROLE_PAYLOAD_TYPE_INVALID_ERROR);
    });
    it("should return 404 when not not found role", async () => {
      const { status, body } = await request(app.getHttpServer())
        .put(`${UPDATE_URL}/${faker.number.int(100)}/name`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`);
      expect(status).toBe(404);
      expect(body.statusCode).toBe(ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR);
    });
    it("should return 403 when attempt login after update role false isActive", async () => {
      jest.spyOn(userService, "joinWithRole").mockResolvedValue({
        id: faker.number.int(100),
        role: {
          id: faker.number.int(100),
          name: faker.word.words(),
          isActive: false,
          permissions: [],
          type: ENUM_ROLE_TYPE.ADMIN,
        } as RoleEntity,
      } as UserEntity);
      const { status, body } = await request(app.getHttpServer())
        .post("/public/user/login")
        .set("x-api-key", xApiKey)
        .send({ email: admin.email, password: password });
      expect(status).toBe(403);
      expect(body.statusCode).toBe(ENUM_ROLE_STATUS_CODE_ERROR.ROLE_INACTIVE_ERROR);
    });
    it("should return 422 when send empty object body", async () => {
      const { body, status } = await request(app.getHttpServer())
        .put(`${UPDATE_URL}/${roleUser.id}/name`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send({});

      expect(status).toBe(422);
      expect(body.statusCode).toBe(ENUM_REQUEST_STATUS_CODE_ERROR.REQUEST_VALIDATION_ERROR);
    });
    it("should return 200 when update name and description successful", async () => {
      const roleUpdateNameDto: RoleUpdateNameDto = {
        name: faker.word.words(),
        description: faker.lorem.words(),
      };
      const { body, status } = await request(app.getHttpServer())
        .put(`${UPDATE_URL}/${roleUser.id}/name`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(roleUpdateNameDto);

      expect(status).toBe(200);
      expect(body.data).toHaveProperty("id");
      expect(body.data).toEqual({
        id: roleUser.id,
        name: roleUpdateNameDto.name,
        description: roleUpdateNameDto.description,
      });
    });
    it("should return 200 when update some role successful", async () => {
      const roleUpdateNameDto: RoleUpdateNameDto = {
        name: faker.word.words(),
      };
      const { body, status } = await request(app.getHttpServer())
        .put(`${UPDATE_URL}/${roleUser.id}/name`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(roleUpdateNameDto);
      expect(status).toBe(200);
      expect(body.data).toHaveProperty("id");
      expect(body.data).toEqual({
        id: roleUser.id,
        name: roleUpdateNameDto.name,
      });
    });
    // WARN: make last test because we change empty permissions
    // FIX: we can't test because AccessToken away same after login is make test is full permissions
    it.skip("should return 403 when attempt after update role empty permissions", async () => {
      const roleUpdateNameDto: RoleUpdateNameDto = {
        name: faker.word.words(),
        description: faker.lorem.words(),
      };
      await request(app.getHttpServer())
        .put(`${UPDATE_URL}/${roleAdmin.id}/name`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(roleUpdateNameDto);

      const resultLogin = await request(app.getHttpServer())
        .post("/public/user/login")
        .set("x-api-key", xApiKey)
        .send({ email: admin.email, password: password });
      const { status, body } = await request(app.getHttpServer())
        .put(`${UPDATE_URL}/${roleAdmin.id}`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${resultLogin.body.data.accessToken}`)
        .send({ ...roleUpdateNameDto, name: "abc" });

      expect(status).toBe(403);
      expect(body.statusCode).toBe(ENUM_POLICY_STATUS_CODE_ERROR.POLICY_ABILITY_FORBIDDEN_ERROR);
    });
  });
});
