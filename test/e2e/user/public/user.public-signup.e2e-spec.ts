import { faker } from "@faker-js/faker";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app/app.module";
import { ApiKeyService } from "src/common/api-key/services/api-key.service";
import { AuthService } from "src/common/auth/services/auth.service";
import { RoleService } from "src/modules/role/services/role.service";
import { ENUM_USER_STATUS_CODE_ERROR } from "src/modules/user/constants/user.status-code.constant";
import { UserSignUpDto } from "src/modules/user/dtos/user.signup.dto-";
import { UserEntity } from "src/modules/user/repository/entities/user.entity";
import { UserService } from "src/modules/user/services/user.service";
import request from "supertest";
import { ApiKeyFaker } from "test/helpers/api-key.faker";
import { RoleFaker } from "test/helpers/role.faker";
import { UserFaker } from "test/helpers/user.faker";

describe("user public signup e2e", () => {
  const USER_SIGNUP_URL = "/public/user/sign-up";
  let app: INestApplication;
  let userService: UserService;
  let roleService: RoleService;
  let authService: AuthService;
  let apiKeyService: ApiKeyService;
  let user: UserEntity;
  let xApiKey: string;

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
    await roleFaker.createRoleUser({ name: "user" });

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

  describe(`${USER_SIGNUP_URL}`, () => {
    it("should throw user exist", async () => {
      const signupDto: UserSignUpDto = {
        email: user.email,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        password: faker.string.alphanumeric(8),
      };
      const { body, status } = await request(app.getHttpServer())
        .post(`${USER_SIGNUP_URL}`)
        .set("application", "json")
        .set("x-api-key", xApiKey)
        .send(signupDto);

      expect(status).toBe(409);
      expect(body.statusCode).toBe(ENUM_USER_STATUS_CODE_ERROR.USER_EMAIL_EXIST_ERROR);
    });
    it("should throw phoneNumber exist", async () => {
      const signupDto: UserSignUpDto = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        password: faker.string.alphanumeric(8),
        mobileNumber: user.mobileNumber,
      };
      const { body, status } = await request(app.getHttpServer())
        .post(`${USER_SIGNUP_URL}`)
        .set("application", "json")
        .set("x-api-key", xApiKey)
        .send(signupDto);

      expect(status).toBe(409);
      expect(body.statusCode).toBe(ENUM_USER_STATUS_CODE_ERROR.USER_MOBILE_NUMBER_EXIST_ERROR);
    });

    it("should return void when signup successful", async () => {
      const signupDto: UserSignUpDto = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        password: faker.string.alphanumeric(8),
        mobileNumber: faker.phone.number("##########"),
      };
      const { status } = await request(app.getHttpServer())
        .post(`${USER_SIGNUP_URL}`)
        .set("application", "json")
        .set("x-api-key", xApiKey)
        .send(signupDto);

      expect(status).toBe(201);
    });
  });
});
