import { faker } from "@faker-js/faker";
import CustomerFaker from "./customer.faker";
import MedicalTeamService from "src/modules/medicalTeam/services/medicalTeam.service";
import CustomerService from "src/modules/customer/services/customer.service";
import { ENUM_MEDICAL_TEAM } from "src/modules/medicalTeam/constants/medicalTeam.enum.constant";
import { MedicalTeam } from "src/modules/medicalTeam/repository/entities/medicalTeam.entity";
import { AddressService } from "src/modules/address/services/address.service";

export class MedicalTeamFaker {
  private readonly customerFaker: CustomerFaker;
  constructor(
    private readonly medicalTeamService: MedicalTeamService,
    private readonly customerService: CustomerService,
    private readonly addressService: AddressService,
  ) {
    this.customerFaker = new CustomerFaker(customerService, addressService);
  }

  public async createMedicalTeam({
    name,
    phones = false,
    isActive = true,
  }: {
    name?: string;
    phones?: boolean;
    isActive?: boolean;
  }): Promise<MedicalTeam> {
    const customer = await this.customerFaker.create({});
    const medicalTeam = await this.medicalTeamService.create({
      name: name ?? faker.word.words(),
      type: faker.helpers.arrayElement(Object.values(ENUM_MEDICAL_TEAM)),
      phones: phones
        ? [{ name: faker.person.firstName(), phoneNumber: faker.phone.number("##########") }]
        : undefined,
      customer,
    });

    if (!isActive) {
      return this.medicalTeamService.inactive(medicalTeam);
    }

    return medicalTeam;
  }
}
