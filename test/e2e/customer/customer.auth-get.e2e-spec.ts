import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app/app.module";
import { ENUM_API_KEY_STATUS_CODE_ERROR } from "src/common/api-key/constants/api-key.status-code.constant";
import { ApiKeyService } from "src/common/api-key/services/api-key.service";
import { ENUM_AUTH_STATUS_CODE_ERROR } from "src/common/auth/constants/auth.status-code.constant";
import { AuthService } from "src/common/auth/services/auth.service";
import { ENUM_POLICY_SUBJECT } from "src/common/policy/constants/policy.enum.constant";
import { ENUM_POLICY_STATUS_CODE_ERROR } from "src/common/policy/constants/policy.status-code.constant";
import { AddressService } from "src/modules/address/services/address.service";
import { ENUM_CUSTOMER_STATUS_CODE_ERROR } from "src/modules/customer/constants/customer.status-code.constant";
import CustomerService from "src/modules/customer/services/customer.service";
import { RoleService } from "src/modules/role/services/role.service";
import { UserEntity } from "src/modules/user/repository/entities/user.entity";
import { UserService } from "src/modules/user/services/user.service";
import request from "supertest";
import { ApiKeyFaker } from "test/helpers/api-key.faker";
import { AuthFaker } from "test/helpers/auth.faker";
import CustomerFaker from "test/helpers/customer.faker";
import { RoleFaker } from "test/helpers/role.faker";
import { UserFaker } from "test/helpers/user.faker";

describe("customer auth controller get e2e", () => {
  const CUSTOMER_GET_URL = "/auth/customer/get";
  let app: INestApplication;
  let userService: UserService;
  let roleService: RoleService;
  let apiKeyService: ApiKeyService;
  let customerService: CustomerService;
  let xApiKey: string;
  let userAccessToken: string;
  let user: UserEntity;
  let userUnPolicy: UserEntity;
  let userUnPolicyAccessToken: string;
  let customerId: number;

  beforeAll(async () => {
    const modRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modRef.createNestApplication();
    userService = modRef.get<UserService>(UserService);
    roleService = modRef.get<RoleService>(RoleService);
    apiKeyService = modRef.get<ApiKeyService>(ApiKeyService);
    customerService = modRef.get<CustomerService>(CustomerService);
    const addressService = modRef.get<AddressService>(AddressService);
    const authService = modRef.get(AuthService);
    await app.init();

    const userFaker = new UserFaker(authService, userService, roleService);
    const apiKeyFaker = new ApiKeyFaker(apiKeyService);
    const roleFaker = new RoleFaker(roleService);
    const authFaker = new AuthFaker(app);
    const customerFaker = new CustomerFaker(customerService, addressService);

    const apiKey = await apiKeyFaker.createApiKey({});
    xApiKey = apiKeyFaker.getXApiKey(apiKey);

    // create role
    const roleUser = await roleFaker.createRoleUserManageBySubject({
      subject: ENUM_POLICY_SUBJECT.CUSTOMER,
    });
    const roleUserUnPolicy = await roleFaker.createRoleUser({});

    customerId = await customerFaker.create({}).then((e) => e.id);

    // create user
    user = await userFaker.createUser({ role: roleUser });
    userUnPolicy = await userFaker.createUser({ role: roleUserUnPolicy });

    // login by user
    const loginResponse = await Promise.all([
      authFaker.login({ email: user.email, xApiKey }),
      authFaker.login({ email: userUnPolicy.email, xApiKey }),
    ]);

    // get accessToken
    userAccessToken = loginResponse[0];
    userUnPolicyAccessToken = loginResponse[1];
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    jest.clearAllMocks();
    await userService.deleteAll();
    await roleService.deleteAll();
    await apiKeyService.deleteAll();
    await customerService.deleteAll();
    await app.close();
  });

  describe("x-api-key", () => {
    it("should return 401 when not send x-api-key", async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`${CUSTOMER_GET_URL}/1`)
        .send();

      expect(status).toBe(401);
      expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_NEEDED_ERROR);
    });
  });

  describe("auth", () => {
    it("should return 401 when not auth", async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`${CUSTOMER_GET_URL}/1`)
        .set("x-api-key", xApiKey)
        .send({});

      expect(status).toBe(401);
      expect(body.statusCode).toBe(ENUM_AUTH_STATUS_CODE_ERROR.AUTH_JWT_ACCESS_TOKEN_ERROR);
    });
    it("should return 403 when not policy", async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`${CUSTOMER_GET_URL}/1`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userUnPolicyAccessToken}`)
        .send({});

      expect(status).toBe(403);
      expect(body.statusCode).toBe(ENUM_POLICY_STATUS_CODE_ERROR.POLICY_ABILITY_FORBIDDEN_ERROR);
    });
  });

  describe("guard", () => {
    it("should return 404 when customer not exist", async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`${CUSTOMER_GET_URL}/1`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .send({});

      expect(status).toBe(404);
      expect(body.statusCode).toBe(ENUM_CUSTOMER_STATUS_CODE_ERROR.CUSTOMER_NOT_FOUND_ERROR);
    });
  });

  describe("response", () => {
    it("should return 200 when get success", async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`${CUSTOMER_GET_URL}/${customerId}`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .send({});

      expect(status).toBe(200);
      expect(body._metadata).toBeDefined();
      expect(body.data.id).toBe(customerId);
    });
  });
});
