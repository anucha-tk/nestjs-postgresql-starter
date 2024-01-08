import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app/app.module";
import { RoleService } from "src/modules/role/services/role.service";
import { UserService } from "src/modules/user/services/user.service";
import { ENUM_API_KEY_STATUS_CODE_ERROR } from "src/common/api-key/constants/api-key.status-code.constant";
import { ApiKeyService } from "src/common/api-key/services/api-key.service";
import { UserFaker } from "test/helpers/user.faker";
import { ApiKeyFaker } from "test/helpers/api-key.faker";
import { AuthService } from "src/common/auth/services/auth.service";
import { AuthFaker } from "test/helpers/auth.faker";
import CustomerService from "src/modules/customer/services/customer.service";
import { RoleFaker } from "test/helpers/role.faker";
import { ENUM_AUTH_STATUS_CODE_ERROR } from "src/common/auth/constants/auth.status-code.constant";
import { ENUM_POLICY_STATUS_CODE_ERROR } from "src/common/policy/constants/policy.status-code.constant";
import { ENUM_REQUEST_STATUS_CODE_ERROR } from "src/common/request/constants/request.status-code.constant";
import {
  ENUM_POLICY_ACTION,
  ENUM_POLICY_SUBJECT,
} from "src/common/policy/constants/policy.enum.constant";
import { faker } from "@faker-js/faker";
import PhoneService from "src/modules/phone/services/phone.service";
import { PhoneFaker } from "test/helpers/phone.faker";
import { ENUM_PHONE_STATUS_CODE_ERROR } from "src/modules/phone/constants/phone.status-code.constant";
import { Phone } from "src/modules/phone/repository/entities/phone.entity";
import { AddressService } from "src/modules/address/services/address.service";

describe("phone auth update e2e", () => {
  const PHONE_UPDATE_URL = "/auth/phone/update";
  let app: INestApplication;
  let userService: UserService;
  let roleService: RoleService;
  let apiKeyService: ApiKeyService;
  let authService: AuthService;
  let customerService: CustomerService;
  let xApiKey: string;
  let userAccessToken: string;
  let userUnPolicyAccessToken: string;
  let phoneService: PhoneService;
  let phoneId: number;
  let phone: Phone;

  beforeAll(async () => {
    const modRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modRef.createNestApplication();
    userService = modRef.get<UserService>(UserService);
    roleService = modRef.get<RoleService>(RoleService);
    apiKeyService = modRef.get<ApiKeyService>(ApiKeyService);
    authService = modRef.get<AuthService>(AuthService);
    customerService = modRef.get<CustomerService>(CustomerService);
    phoneService = modRef.get<PhoneService>(PhoneService);
    const addressService = modRef.get<AddressService>(AddressService);
    await app.init();

    const userFaker = new UserFaker(authService, userService, roleService);
    const apiKeyFaker = new ApiKeyFaker(apiKeyService);
    const authFaker = new AuthFaker(app);
    const roleFaker = new RoleFaker(roleService);
    const phoneFaker = new PhoneFaker(phoneService, customerService, addressService);

    const rolePhoneManage = await roleFaker.createRoleUser({
      permissions: [{ subject: ENUM_POLICY_SUBJECT.PHONE, action: [ENUM_POLICY_ACTION.MANAGE] }],
    });
    const user = await userFaker.createUser({ role: rolePhoneManage });
    const userUnPolicy = await userFaker.createUser({});
    const password = await userFaker.getPassword();
    phone = await phoneFaker.createPhoneCustomer({});
    phoneId = phone.id;

    const apiKey = await apiKeyFaker.createApiKey({});
    xApiKey = apiKeyFaker.getXApiKey(apiKey);

    userAccessToken = await authFaker.login({ email: user.email, password, xApiKey });
    userUnPolicyAccessToken = await authFaker.login({
      email: userUnPolicy.email,
      password,
      xApiKey,
    });
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Auth", () => {
    describe("x-api-key", () => {
      it("should return 401 when not send x-api-key", async () => {
        const { status, body } = await request(app.getHttpServer())
          .put(`${PHONE_UPDATE_URL}/123`)
          .send();

        expect(status).toBe(401);
        expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_NEEDED_ERROR);
      });
    });
    describe("Auth and Authorization", () => {
      it("should return 401 when not auth", async () => {
        const { status, body } = await request(app.getHttpServer())
          .put(`${PHONE_UPDATE_URL}/123`)
          .set("x-api-key", xApiKey);

        expect(status).toBe(401);
        expect(body.statusCode).toBe(ENUM_AUTH_STATUS_CODE_ERROR.AUTH_JWT_ACCESS_TOKEN_ERROR);
      });
      it("should return 403 when policy not include", async () => {
        const { status, body } = await request(app.getHttpServer())
          .put(`${PHONE_UPDATE_URL}/123`)
          .set("x-api-key", xApiKey)
          .set("Authorization", `Bearer ${userUnPolicyAccessToken}`);

        expect(status).toBe(403);
        expect(body.statusCode).toBe(ENUM_POLICY_STATUS_CODE_ERROR.POLICY_ABILITY_FORBIDDEN_ERROR);
      });
    });
  });

  describe("validation body", () => {
    it("should return 422 when empty body", async () => {
      const { status, body } = await request(app.getHttpServer())
        .put(`${PHONE_UPDATE_URL}/${phoneId}`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userAccessToken}`);

      expect(status).toBe(422);
      expect(body.statusCode).toBe(ENUM_REQUEST_STATUS_CODE_ERROR.REQUEST_VALIDATION_ERROR);
    });
    it("should return 404 when phone not found", async () => {
      const createDto = {
        name: faker.person.firstName(),
        phoneNumber: "000000000",
      };

      const { status, body } = await request(app.getHttpServer())
        .put(`${PHONE_UPDATE_URL}/123`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .send(createDto);

      expect(status).toBe(404);
      expect(body.statusCode).toBe(ENUM_PHONE_STATUS_CODE_ERROR.PHONE_NOT_FOUND_ERROR);
    });
  });

  describe("response", () => {
    it("should return 200 and id when update phone success", async () => {
      const createDto = {
        name: faker.person.firstName(),
        phoneNumber: "111111111",
      };

      const { status, body } = await request(app.getHttpServer())
        .put(`${PHONE_UPDATE_URL}/${phoneId}`)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .send(createDto);

      expect(status).toBe(200);
      expect(body._metadata).toBeDefined();
      expect(body.data).toEqual({ ...createDto, id: expect.any(Number), isActive: true });
    });
  });
});
