import { faker } from "@faker-js/faker";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app/app.module";
import { ENUM_API_KEY_STATUS_CODE_ERROR } from "src/common/api-key/constants/api-key.status-code.constant";
import { ApiKeyService } from "src/common/api-key/services/api-key.service";
import { ENUM_AUTH_STATUS_CODE_ERROR } from "src/common/auth/constants/auth.status-code.constant";
import { AuthService } from "src/common/auth/services/auth.service";
import {
  ENUM_POLICY_ACTION,
  ENUM_POLICY_SUBJECT,
} from "src/common/policy/constants/policy.enum.constant";
import { ENUM_POLICY_STATUS_CODE_ERROR } from "src/common/policy/constants/policy.status-code.constant";
import { ENUM_REQUEST_STATUS_CODE_ERROR } from "src/common/request/constants/request.status-code.constant";
import { AddressService } from "src/modules/address/services/address.service";
import { ENUM_CUSTOMER_TYPE } from "src/modules/customer/constants/customer.enum.constant";
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

describe("customer auth controller create e2e", () => {
  const CUSTOMER_CREATE_URL = "/auth/customer/create";
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
    const roleUserWithCustomer = await roleFaker.createRoleUser({
      permissions: [{ subject: ENUM_POLICY_SUBJECT.CUSTOMER, action: [ENUM_POLICY_ACTION.MANAGE] }],
    });
    const roleUserUnPolicy = await roleFaker.createRoleUser({});

    // create user
    user = await userFaker.createUser({ role: roleUserWithCustomer });
    userUnPolicy = await userFaker.createUser({ role: roleUserUnPolicy });

    await Promise.all([
      customerFaker.create({ thaiName: "abc" }),
      customerFaker.create({ englishName: "xyz" }),
    ]);

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
      const { status, body } = await request(app.getHttpServer()).post(CUSTOMER_CREATE_URL).send();

      expect(status).toBe(401);
      expect(body.statusCode).toBe(ENUM_API_KEY_STATUS_CODE_ERROR.API_KEY_NEEDED_ERROR);
    });
  });

  describe("auth", () => {
    it("should return 401 when not auth", async () => {
      const { status, body } = await request(app.getHttpServer())
        .post(CUSTOMER_CREATE_URL)
        .set("x-api-key", xApiKey)
        .send({});

      expect(status).toBe(401);
      expect(body.statusCode).toBe(ENUM_AUTH_STATUS_CODE_ERROR.AUTH_JWT_ACCESS_TOKEN_ERROR);
    });
    it("should return 403 when not policy", async () => {
      const { status, body } = await request(app.getHttpServer())
        .post(CUSTOMER_CREATE_URL)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userUnPolicyAccessToken}`)
        .send({});

      expect(status).toBe(403);
      expect(body.statusCode).toBe(ENUM_POLICY_STATUS_CODE_ERROR.POLICY_ABILITY_FORBIDDEN_ERROR);
    });
  });

  describe("body guard", () => {
    it("should return 422 when send empty", async () => {
      const { status, body } = await request(app.getHttpServer())
        .post(CUSTOMER_CREATE_URL)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .send({});

      expect(status).toBe(422);
      expect(body.statusCode).toBe(ENUM_REQUEST_STATUS_CODE_ERROR.REQUEST_VALIDATION_ERROR);
    });

    it("should return 422 when tax id invalid", async () => {
      const createCustomerDto = {
        thaiName: "เอบีซี",
        englishName: faker.company.name(),
        address: faker.location.street(),
        subDistrict: faker.location.city(),
        district: faker.location.state(),
        province: faker.location.county(),
        postalCode: "50660",
        tax: "1234546789", //send invalid tax
        type: ENUM_CUSTOMER_TYPE.CLINIC,
      };
      const { status, body } = await request(app.getHttpServer())
        .post(CUSTOMER_CREATE_URL)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .send(createCustomerDto);

      expect(status).toBe(422);
      expect(body.statusCode).toBe(ENUM_REQUEST_STATUS_CODE_ERROR.REQUEST_VALIDATION_ERROR);
    });
    it("should return 400 when thaiName exist", async () => {
      const createCustomerDto = {
        thaiName: "abc",
        englishName: faker.company.name(),
        address: faker.location.street(),
        subDistrict: faker.location.city(),
        district: faker.location.state(),
        province: faker.location.county(),
        postalCode: "50660",
        tax: "1501387589713",
        type: ENUM_CUSTOMER_TYPE.CLINIC,
      };
      const { status, body } = await request(app.getHttpServer())
        .post(CUSTOMER_CREATE_URL)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .send(createCustomerDto);

      expect(status).toBe(400);
      expect(body.statusCode).toBe(ENUM_CUSTOMER_STATUS_CODE_ERROR.CUSTOMER_EXIST_ERROR);
    });
    it("should return 400 when englishName exist", async () => {
      const createCustomerDto = {
        thaiName: faker.company.name(),
        englishName: "xyz",
        address: faker.location.street(),
        subDistrict: faker.location.city(),
        district: faker.location.state(),
        province: faker.location.county(),
        postalCode: "50660",
        tax: "1501387589713",
        type: ENUM_CUSTOMER_TYPE.CLINIC,
      };
      const { status, body } = await request(app.getHttpServer())
        .post(CUSTOMER_CREATE_URL)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .send(createCustomerDto);

      expect(status).toBe(400);
      expect(body.statusCode).toBe(ENUM_CUSTOMER_STATUS_CODE_ERROR.CUSTOMER_EXIST_ERROR);
    });
  });

  describe("response", () => {
    it("should return 201 response id when create success", async () => {
      const createCustomerDto = {
        thaiName: "คลินิกทันตกรรม เอบีซี",
        englishName: "Durgan, Kuphal and Denesik",
        tax: "1501387589713",
        type: "unknown",
        address: {
          street: "Carter Flats",
          subDistrict: "South Delilahton",
          district: "Buckinghamshire",
          province: "Ohio",
          postalCode: "50660",
        },
        phones: [
          {
            name: "Merle",
            phoneNumber: "172260530",
          },
        ],
        medicalTeams: [
          {
            name: "Katelynn",
            type: "staff",
            phones: [
              {
                name: "Merle",
                phoneNumber: "172260530",
              },
            ],
          },
        ],
      };

      const { status, body } = await request(app.getHttpServer())
        .post(CUSTOMER_CREATE_URL)
        .set("x-api-key", xApiKey)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .send(createCustomerDto);

      expect(status).toBe(201);
      expect(body.data.id).toBeDefined();
      expect(body._metadata).toBeDefined();
      expect(body.data.address.street).toBe(createCustomerDto.address.street);
      expect(body.data.phones[0].name).toBe(createCustomerDto.phones[0].name);
      expect(body.data.medicalTeams[0].name).toBe(createCustomerDto.medicalTeams[0].name);
      expect(body.data.medicalTeams[0].phones[0].name).toBe(
        createCustomerDto.medicalTeams[0].phones[0].name,
      );
    });
  });
});
