import { faker } from "@faker-js/faker";
import { ENUM_CUSTOMER_TYPE } from "src/modules/customer/constants/customer.enum.constant";
import { CustomerCreateRawDto } from "src/modules/customer/dtos/customer.createRaw.dto";
import { Customer } from "src/modules/customer/repository/entities/customer.entity";
import CustomerService from "src/modules/customer/services/customer.service";
import { AddressFaker } from "./address.faker";
import { AddressService } from "src/modules/address/services/address.service";

type CustomerCreateFaker = {
  thaiName?: string;
  englishName?: string;
  isActive?: boolean;
  deleted?: boolean;
};

class CustomerFaker {
  private readonly addressFaker: AddressFaker;
  constructor(
    private readonly customerService: CustomerService,
    private readonly addressService: AddressService,
  ) {
    this.addressFaker = new AddressFaker(this.addressService);
  }

  async create({
    thaiName,
    englishName,
    isActive = true,
    deleted = false,
  }: CustomerCreateFaker): Promise<Customer> {
    const address = await this.addressFaker.create({});
    const customerBody: CustomerCreateRawDto = {
      thaiName: thaiName ?? faker.company.name(),
      englishName: englishName ?? faker.company.name(),
      tax: "0000000000000",
      type: faker.helpers.arrayElement(Object.values(ENUM_CUSTOMER_TYPE)),
      isActive,
      address,
    };
    const customer = await this.customerService.createRaw(customerBody);
    if (deleted) {
      await this.customerService.softRemove(customer);
      return { ...customer, deletedAt: new Date() };
    }
    return customer;
  }
}

export default CustomerFaker;
