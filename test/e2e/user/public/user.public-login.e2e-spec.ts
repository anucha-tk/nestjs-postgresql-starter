import { faker } from "@faker-js/faker";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app/app.module";
import { ApiKeyService } from "src/common/api-key/services/api-key.service";
import { AuthService } from "src/common/auth/services/auth.service";
import { ENUM_ROLE_STATUS_CODE_ERROR } from "src/modules/role/constants/role.status-code.constant";
import { RoleService } from "src/modules/role/services/role.service";
import { ENUM_USER_STATUS_CODE_SUCCESS } from "src/modules/user/constants/user.status-code.constant";
import { UserLoginDto } from "src/modules/user/dtos/user.login.dto";
import { UserEntity } from "src/modules/user/repository/entities/user.entity";
import { UserService } from "src/modules/user/services/user.service";
import request from "supertest";
import { ApiKeyFaker } from "test/helpers/api-key.faker";
import { UserFaker } from "test/helpers/user.faker";

describe("user public login e2e", () => {
  let app: INestApplication;
  let userService: UserService;
  let roleService: RoleService;
  let authService: AuthService;
  let apiKeyService: ApiKeyService;
  let user: UserEntity;
  let xApiKey: string;
  let mockPassword = "";

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
    const apiKeyFaker = new ApiKeyFaker(apiKeyService);

    user = await userFaker.createUser({});

    mockPassword = UserFaker.password;

    const apiKey = await apiKeyFaker.createApiKey({});
    xApiKey = apiKeyFaker.getXApiKey(apiKey);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    jest.clearAllMocks();
    await apiKeyService.deleteAll();
    await userService.deleteAll();
    await roleService.deleteAll();
    await app.close();
  });

  describe("login", () => {
    describe("dto", () => {
      it("should return 422 when empty body", async () => {
        const { body, status } = await request(app.getHttpServer())
          .post("/public/user/login")
          .set("x-api-key", xApiKey);

        expect(body).toBeDefined();
        expect(status).toBe(422);
        expect(body.message).toMatch(/Validation error/i);
        expect(body.errors).toBeDefined();
      });

      it("should return 422 when empty password", async () => {
        const loginDto: UserLoginDto = {
          email: faker.internet.email(),
          password: "",
        };
        const { body, status } = await request(app.getHttpServer())
          .post("/public/user/login")
          .set("x-api-key", xApiKey)
          .set("application", "json")
          .send(loginDto);

        expect(body).toBeDefined();
        expect(status).toBe(422);
        expect(body.message).toMatch(/Validation error/i);
        expect(body.errors).toBeDefined();
      });

      it("should return 422 when empty email", async () => {
        const loginDto: UserLoginDto = {
          email: "",
          password: faker.string.alphanumeric(8),
        };
        const { body, status } = await request(app.getHttpServer())
          .post("/public/user/login")
          .set("x-api-key", xApiKey)
          .set("application", "json")
          .send(loginDto);

        expect(body).toBeDefined();
        expect(status).toBe(422);
        expect(body.message).toMatch(/Validation error/i);
        expect(body.errors).toBeDefined();
      });
    });

    it("should return 404 when user not found", async () => {
      const loginDto: UserLoginDto = {
        email: faker.internet.email(),
        password: faker.string.alphanumeric(8),
      };
      const { body, status } = await request(app.getHttpServer())
        .post("/public/user/login")
        .set("x-api-key", xApiKey)
        .set("application", "json")
        .send(loginDto);

      expect(body).toBeDefined();
      expect(status).toBe(404);
      expect(body.message).toMatch(/User not found/i);
    });

    it("should return 400 when password not match", async () => {
      const loginDto: UserLoginDto = {
        email: user.email,
        password: "123456",
      };
      const { body, status } = await request(app.getHttpServer())
        .post("/public/user/login")
        .set("x-api-key", xApiKey)
        .set("application", "json")
        .send(loginDto);

      expect(body).toBeDefined();
      expect(status).toBe(400);
      expect(body.message).toMatch(/password not match/i);
    });

    it("should return 403 when user is block", async () => {
      jest.spyOn(userService, "findOneByEmail").mockResolvedValue({ ...user, blocked: true });

      const loginDto: UserLoginDto = {
        email: user.email,
        password: mockPassword,
      };
      const { body, status } = await request(app.getHttpServer())
        .post("/public/user/login")
        .set("x-api-key", xApiKey)
        .send(loginDto);

      expect(body).toBeDefined();
      expect(status).toBe(403);
    });

    it("should return 403 when user is inactivePermanent", async () => {
      jest
        .spyOn(userService, "findOneByEmail")
        .mockResolvedValue({ ...user, inactivePermanent: true });

      const loginDto: UserLoginDto = {
        email: user.email,
        password: mockPassword,
      };
      const { body, status } = await request(app.getHttpServer())
        .post("/public/user/login")
        .set("x-api-key", xApiKey)
        .set("application", "json")
        .send(loginDto);

      expect(body).toBeDefined();
      expect(status).toBe(403);
      expect(body.message).toMatch(/inactive permanent/i);
    });
    it("should return 403 when user is isActive", async () => {
      jest.spyOn(userService, "findOneByEmail").mockResolvedValue({ ...user, isActive: false });

      const loginDto: UserLoginDto = {
        email: user.email,
        password: mockPassword,
      };
      const { body, status } = await request(app.getHttpServer())
        .post("/public/user/login")
        .set("x-api-key", xApiKey)
        .set("application", "json")
        .send(loginDto);

      expect(body).toBeDefined();
      expect(status).toBe(403);
      expect(body.message).toMatch(/inactive/i);
    });
    it("should return 403 when role is inActive", async () => {
      jest
        .spyOn(userService, "joinWithRole")
        .mockResolvedValue({ ...user, role: { isActive: false } } as UserEntity);

      const loginDto: UserLoginDto = {
        email: user.email,
        password: mockPassword,
      };
      const { body, status } = await request(app.getHttpServer())
        .post("/public/user/login")
        .set("x-api-key", xApiKey)
        .set("application", "json")
        .send(loginDto);

      expect(body).toBeDefined();
      expect(status).toBe(403);
      expect(body.statusCode).toBe(ENUM_ROLE_STATUS_CODE_ERROR.ROLE_INACTIVE_ERROR);
    });
    it.skip("should return 403 when passwordExpired", async () => {
      // NOTE: we remove check passwordExpired on login api, so skip test
      jest.spyOn(authService, "checkPasswordExpired").mockResolvedValue(true);
      const loginDto: UserLoginDto = {
        email: user.email,
        password: mockPassword,
      };
      const { body, status } = await request(app.getHttpServer())
        .post("/public/user/login")
        .set("x-api-key", xApiKey)
        .set("application", "json")
        .send(loginDto);

      expect(body).toBeDefined();
      expect(status).toBe(403);
      expect(body.statusCode).toBe(ENUM_USER_STATUS_CODE_SUCCESS.USER_PASSWORD_EXPIRED_ERROR);
    });
    it("should return 200 when login successful", async () => {
      const loginDto: UserLoginDto = {
        email: user.email,
        password: mockPassword,
      };
      const { body, status } = await request(app.getHttpServer())
        .post("/public/user/login")
        .set("x-api-key", xApiKey)
        .set("application", "json")
        .send(loginDto);

      expect(body).toBeDefined();
      expect(status).toBe(200);
      expect(body.data).toHaveProperty("accessToken");
      expect(body.data).toHaveProperty("refreshToken");
    });

    describe("attempt", () => {
      // WARN: should last because it to many request
      beforeAll(async () => {
        const modRef: TestingModule = await Test.createTestingModule({
          imports: [AppModule],
        }).compile();

        app = modRef.createNestApplication();
        userService = modRef.get<UserService>(UserService);
        roleService = modRef.get<RoleService>(RoleService);
        await app.init();
      });

      afterAll(async () => {
        jest.clearAllMocks();
        await userService.deleteAll();
        await roleService.deleteAll();
      });

      it("should return 403 when passwordAttemptMax", async () => {
        const loginDto: UserLoginDto = {
          email: user.email,
          password: "123456",
        };

        let attempt = 0;
        while (attempt < 6) {
          await request(app.getHttpServer())
            .post("/public/user/login")
            .set("application", "json")
            .set("x-api-key", xApiKey)
            .send(loginDto);
          attempt++;
        }

        const { body, status } = await request(app.getHttpServer())
          .post("/public/user/login")
          .set("application", "json")
          .set("x-api-key", xApiKey)
          .send({ email: user.email, password: mockPassword });

        expect(status).toBe(403);
        expect(body.message).toMatch(/Password attempt user max/i);
      });
    });
  });
});
