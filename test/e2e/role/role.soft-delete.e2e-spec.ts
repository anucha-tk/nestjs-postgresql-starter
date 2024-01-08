import { faker } from "@faker-js/faker";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app/app.module";
import { ENUM_API_KEY_STATUS_CODE_ERROR } from "src/common/api-key/constants/api-key.status-code.constant";
import { ApiKeyService } from "src/common/api-key/services/api-key.service";
import { ENUM_AUTH_STATUS_CODE_ERROR } from "src/common/auth/constants/auth.status-code.constant";
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

describe("role softDelete e2e", () => {
  const DELETE_URL = "/admin/role/soft-delete";
  let app: INestApplication;
  let userService: UserService;
  let roleService: RoleService;
  let apiKeyService: ApiKeyService;
  let authService: AuthService;
  let userAccessToken: string;
  let adminAccessToken: string;
  let xApiKey: string;
  let roleUser: RoleEntity;
  let rolePublic: RoleEntity;
  let admin: UserEntity;

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

    const user = await userFaker.createUser({});
    admin = await userFaker.createAdmin({});
    const password = await userFaker.getPassword();
    roleUser = await roleFaker.createRoleUser({ name: "user" });
    rolePublic = await roleFaker.createRoleUser({ name: "public" });

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

  describe(`DELETE ${DELETE_URL}`, () => {
    describe("x-api-key", () => {
      it("should return 401 when not send x-api-key", async () => {
        const { status, body } = await request(app.getHttpServer()).delete(
          `${DELETE_URL}/${roleUser.id}`,
        );

        expect(status).toBe(401);
        expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_NEEDED_ERROR);
      });
    });
    describe("auth", () => {
      it("should return 401 when not auth", async () => {
        const { status, body } = await request(app.getHttpServer())
          .delete(`${DELETE_URL}/${roleUser.id}`)
          .set("x-api-key", xApiKey);

        expect(status).toBe(401);
        expect(body.statusCode).toBe(ENUM_AUTH_STATUS_CODE_ERROR.AUTH_JWT_ACCESS_TOKEN_ERROR);
      });
      it("should return 403 when not admin or superAdmin", async () => {
        const { status, body } = await request(app.getHttpServer())
          .delete(`${DELETE_URL}/${roleUser.id}`)
          .set("x-api-key", xApiKey)
          .set("Authorization", `Bearer ${userAccessToken}`);

        expect(status).toBe(403);
        expect(body.statusCode).toBe(ENUM_ROLE_STATUS_CODE_ERROR.ROLE_PAYLOAD_TYPE_INVALID_ERROR);
      });
    });
    describe("get guard", () => {
      it("should return 404 when not not found role", async () => {
        const { status, body } = await request(app.getHttpServer())
          .delete(`${DELETE_URL}/${faker.number.int({ min: 1000, max: 2000 })}`)
          .set("x-api-key", xApiKey)
          .set("Authorization", `Bearer ${adminAccessToken}`);

        expect(status).toBe(404);
        expect(body.statusCode).toBe(ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR);
      });
    });
    describe("role delete logic", () => {
      it("should return 409 when role used", async () => {
        const { status, body } = await request(app.getHttpServer())
          .delete(`${DELETE_URL}/${admin.role.id}`)
          .set("x-api-key", xApiKey)
          .set("Authorization", `Bearer ${adminAccessToken}`);

        expect(status).toBe(409);
        expect(body.statusCode).toBe(ENUM_ROLE_STATUS_CODE_ERROR.ROLE_USED_ERROR);
      });
      it("should return 200 when delete role not used successful", async () => {
        const { status, body } = await request(app.getHttpServer())
          .delete(`${DELETE_URL}/${rolePublic.id}`)
          .set("x-api-key", xApiKey)
          .set("Authorization", `Bearer ${adminAccessToken}`);

        expect(status).toBe(200);
        expect(body.data).toHaveProperty("id");
      });
      it("should return 404 when attempt delete role after delete successful", async () => {
        await request(app.getHttpServer())
          .delete(`${DELETE_URL}/${rolePublic.id}`)
          .set("x-api-key", xApiKey)
          .set("Authorization", `Bearer ${adminAccessToken}`);
        const { status, body } = await request(app.getHttpServer())
          .delete(`${DELETE_URL}/${rolePublic.id}`)
          .set("x-api-key", xApiKey)
          .set("Authorization", `Bearer ${adminAccessToken}`);

        expect(status).toBe(404);
        expect(body.statusCode).toBe(ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR);
      });
    });
  });
});
