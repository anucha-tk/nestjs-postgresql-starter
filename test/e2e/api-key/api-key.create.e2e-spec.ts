import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app/app.module";
import { ApiKeyService } from "src/common/api-key/services/api-key.service";
import { RoleService } from "src/modules/role/services/role.service";
import { UserService } from "src/modules/user/services/user.service";
import request from "supertest";
import { faker } from "@faker-js/faker";
import { ApiKeyCreateDto } from "src/common/api-key/dtos/api-key.create.dto";
import { ENUM_API_KEY_TYPE } from "src/common/api-key/constants/api-key.enum.constant";
import { useContainer } from "class-validator";
import { UserEntity } from "src/modules/user/repository/entities/user.entity";
import { AuthService } from "src/common/auth/services/auth.service";
import { UserFaker } from "test/helpers/user.faker";
import { ApiKeyFaker } from "test/helpers/api-key.faker";
import { AuthFaker } from "test/helpers/auth.faker";

describe("api-key create e2e", () => {
  const APIKEY_CREATE_URL = `/admin/api-key/create`;
  let app: INestApplication;
  let userService: UserService;
  let roleService: RoleService;
  let apiKeyService: ApiKeyService;
  let admin: UserEntity;
  let authService: AuthService;
  let xApiKey: string;
  let adminAccessToken: string;

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
    admin = await userFaker.createAdmin({});
    const password = await userFaker.getPassword();

    const apiKeyCreate = await apiKeyFaker.createApiKey({});

    xApiKey = apiKeyFaker.getXApiKey(apiKeyCreate);

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

  describe(`POST ${APIKEY_CREATE_URL}`, () => {
    it("should return 422 when empty body", async () => {
      const { status } = await request(app.getHttpServer())
        .post(APIKEY_CREATE_URL)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(status).toBe(422);
    });
    it("should return apiKey doc and secret when create successful", async () => {
      const apiKeyCreateDto: ApiKeyCreateDto = {
        name: faker.word.words(),
        type: ENUM_API_KEY_TYPE.PUBLIC,
      };
      const { body, status } = await request(app.getHttpServer())
        .post(APIKEY_CREATE_URL)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(apiKeyCreateDto);

      expect(status).toBe(201);
      expect(body.data.id).toBeDefined();
      expect(body.data.key).toBeDefined();
      expect(body.data.secret).toBeDefined();
    });
  });
});
