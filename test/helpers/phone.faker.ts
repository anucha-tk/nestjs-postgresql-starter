import { faker } from "@faker-js/faker";
import CustomerService from "src/modules/customer/services/customer.service";
import { Phone } from "src/modules/phone/repository/entities/phone.entity";
import PhoneService from "src/modules/phone/services/phone.service";
import CustomerFaker from "./customer.faker";
import { AddressService } from "src/modules/address/services/address.service";

export class PhoneFaker {
  private readonly customerFaker: CustomerFaker;
  constructor(
    private readonly phoneService: PhoneService,
    private readonly customerService: CustomerService,
    private readonly addressService: AddressService,
  ) {
    this.customerFaker = new CustomerFaker(customerService, addressService);
  }

  public async createPhoneCustomer({
    name,
    phoneNumber,
    isActive = true,
  }: {
    name?: string;
    phoneNumber?: string;
    isActive?: boolean;
  }): Promise<Phone> {
    const customer = await this.customerFaker.create({});
    const phone = await this.phoneService.createPhoneCustomer({
      name: name ?? faker.word.words(),
      phoneNumber: phoneNumber ?? faker.phone.number("##########"),
      customer,
    });

    if (!isActive) {
      const inActivePhone = await this.phoneService.inactive(phone);
      return inActivePhone;
    }
    return phone;
  }
}
