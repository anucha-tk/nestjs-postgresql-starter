import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app/app.module";
import { RoleService } from "src/modules/role/services/role.service";
import { UserService } from "src/modules/user/services/user.service";
import { ENUM_AUTH_STATUS_CODE_ERROR } from "src/common/auth/constants/auth.status-code.constant";
import { ENUM_API_KEY_STATUS_CODE_ERROR } from "src/common/api-key/constants/api-key.status-code.constant";
import { ApiKeyService } from "src/common/api-key/services/api-key.service";
import { UserChangePasswordDto } from "src/modules/user/dtos/user.change-password.dto";
import { ENUM_REQUEST_STATUS_CODE_ERROR } from "src/common/request/constants/request.status-code.constant";
import { ENUM_USER_STATUS_CODE_ERROR } from "src/modules/user/constants/user.status-code.constant";
import { faker } from "@faker-js/faker";
import { ConfigService } from "@nestjs/config";
import { UserEntity } from "src/modules/user/repository/entities/user.entity";
import { UserFaker } from "test/helpers/user.faker";
import { ApiKeyFaker } from "test/helpers/api-key.faker";
import { AuthService } from "src/common/auth/services/auth.service";
import { AuthFaker } from "test/helpers/auth.faker";

describe("user change password e2e", () => {
  const USER_CHANGE_PASSWORD_URL = "/auth/user/change-password";
  let app: INestApplication;
  let userService: UserService;
  let roleService: RoleService;
  let apiKeyService: ApiKeyService;
  let configService: ConfigService;
  let authService: AuthService;
  let user: UserEntity;
  let xApiKey: string;
  let userAccessToken: string;
  let password: string;

  beforeAll(async () => {
    const modRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modRef.createNestApplication();
    userService = modRef.get<UserService>(UserService);
    roleService = modRef.get<RoleService>(RoleService);
    apiKeyService = modRef.get<ApiKeyService>(ApiKeyService);
    configService = modRef.get<ConfigService>(ConfigService);
    authService = modRef.get<AuthService>(AuthService);
    await app.init();

    const userFaker = new UserFaker(authService, userService, roleService);
    const apiKeyFaker = new ApiKeyFaker(apiKeyService);
    const authFaker = new AuthFaker(app);

    user = await userFaker.createUser({});
    password = await userFaker.getPassword();

    const apiKey = await apiKeyFaker.createApiKey({});
    xApiKey = apiKeyFaker.getXApiKey(apiKey);

    userAccessToken = await authFaker.login({ email: user.email, password, xApiKey });
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    jest.clearAllMocks();
    await userService.deleteAll();
    await roleService.deleteAll();
    await apiKeyService.deleteAll();
  });

  afterAll(async () => {
    await app.close();
  });
  describe(`PATCH ${USER_CHANGE_PASSWORD_URL}`, () => {
    describe("x-api-key", () => {
      it("should return 401 when not send x-api-key", async () => {
        const { status, body } = await request(app.getHttpServer()).patch(USER_CHANGE_PASSWORD_URL);

        expect(status).toBe(401);
        expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_NEEDED_ERROR);
      });
    });
    describe("auth", () => {
      it("should return 401 when not auth", async () => {
        const { status, body } = await request(app.getHttpServer())
          .patch(USER_CHANGE_PASSWORD_URL)
          .set("x-api-key", xApiKey);

        expect(status).toBe(401);
        expect(body.statusCode).toBe(ENUM_AUTH_STATUS_CODE_ERROR.AUTH_JWT_ACCESS_TOKEN_ERROR);
      });
    });

    describe("body validate", () => {
      it("should return 422 when empty body", async () => {
        const { status, body } = await request(app.getHttpServer())
          .patch(USER_CHANGE_PASSWORD_URL)
          .set("x-api-key", xApiKey)
          .set("Authorization", `Bearer ${userAccessToken}`);

        expect(status).toBe(422);
        expect(body.statusCode).toBe(ENUM_REQUEST_STATUS_CODE_ERROR.REQUEST_VALIDATION_ERROR);
      });
    });
    describe("password attempt true", () => {
      it("should return 403 when first attempt is maxAttempt password", async () => {
        jest.spyOn(configService, "get").mockImplementation((path: string) => {
          switch (path) {
            case "auth.password.attempt":
              return true;
            case "auth.password.maxAttempt":
              return 5;
          }
        });
        const user = new UserEntity();
        user.id = faker.number.int(100);
        user.passwordAttempt = 5;
        jest.spyOn(userService, "joinWithRole").mockResolvedValue(user);

        const { status, body } = await request(app.getHttpServer())
          .patch(USER_CHANGE_PASSWORD_URL)
          .set("x-api-key", xApiKey)
          .set("Authorization", `Bearer ${userAccessToken}`)
          .send({ newPassword: "abc123", oldPassword: "xyz123" } as UserChangePasswordDto);

        expect(status).toBe(403);
        expect(body.statusCode).toBe(ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_ATTEMPT_MAX_ERROR);
      });
      it("should return 400 when old password not match", async () => {
        const { status, body } = await request(app.getHttpServer())
          .patch(USER_CHANGE_PASSWORD_URL)
          .set("x-api-key", xApiKey)
          .set("Authorization", `Bearer ${userAccessToken}`)
          .send({ newPassword: "abc123", oldPassword: "xyz123" } as UserChangePasswordDto);

        expect(status).toBe(400);
        expect(body.statusCode).toBe(ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_NOT_MATCH_ERROR);
      });
      it("should return 403 when try oldPassword not match and maxAttempt", async () => {
        jest.spyOn(configService, "get").mockImplementation((path: string) => {
          switch (path) {
            case "auth.password.attempt":
              return true;
            case "auth.password.maxAttempt":
              return 2;
          }
        });
        let attempt = 1;
        while (attempt < 2) {
          const { status, body } = await request(app.getHttpServer())
            .patch(USER_CHANGE_PASSWORD_URL)
            .set("x-api-key", xApiKey)
            .set("Authorization", `Bearer ${userAccessToken}`)
            .send({ newPassword: "abc123", oldPassword: "xyz123" } as UserChangePasswordDto);
          attempt++;
          expect(status).toBe(400);
          expect(body.statusCode).toBe(ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_NOT_MATCH_ERROR);
        }
        const { status, body } = await request(app.getHttpServer())
          .patch(USER_CHANGE_PASSWORD_URL)
          .set("x-api-key", xApiKey)
          .set("Authorization", `Bearer ${userAccessToken}`)
          .send({ newPassword: "abc123", oldPassword: "xyz123" } as UserChangePasswordDto);

        expect(status).toBe(403);
        expect(body.statusCode).toBe(ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_ATTEMPT_MAX_ERROR);
      });
    });
  });
  describe("change-password logic", () => {
    const newPassword = faker.string.alphanumeric(8);
    it("should return 400 when newPassword is same oldPassword", async () => {
      const { status, body } = await request(app.getHttpServer())
        .patch(USER_CHANGE_PASSWORD_URL)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .send({ newPassword: password, oldPassword: password } as UserChangePasswordDto);

      expect(status).toBe(400);
      expect(body.statusCode).toBe(
        ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_NEW_MUST_DIFFERENCE_ERROR,
      );
    });
    it("should return 200 when update password", async () => {
      const { status } = await request(app.getHttpServer())
        .patch(USER_CHANGE_PASSWORD_URL)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .send({
          newPassword,
          oldPassword: password,
        } as UserChangePasswordDto);

      expect(status).toBe(200);
    });
    it("should return 400 when login after update password", async () => {
      const { status } = await request(app.getHttpServer())
        .patch(USER_CHANGE_PASSWORD_URL)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .send({
          newPassword: faker.string.alphanumeric(8),
          oldPassword: newPassword,
        } as UserChangePasswordDto);

      expect(status).toBe(200);

      const response = await request(app.getHttpServer())
        .post("/public/user/login")
        .send({ email: user.email, password: password })
        .set("x-api-key", xApiKey);

      expect(response.status).toBe(400);
      expect(response.body.statusCode).toBe(
        ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_NOT_MATCH_ERROR,
      );
    });
  });
});
