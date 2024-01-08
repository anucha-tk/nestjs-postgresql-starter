import { faker } from "@faker-js/faker";
import { Address } from "src/modules/address/repository/entities/address.entity";
import { AddressService } from "src/modules/address/services/address.service";

export class AddressFaker {
  constructor(private readonly addressService: AddressService) {}

  create({}): Promise<Address> {
    const dto = {
      street: faker.location.street(),
      subDistrict: faker.location.city(),
      district: faker.location.state(),
      province: faker.location.county(),
      postalCode: faker.location.zipCode("#####"),
    };
    return this.addressService.createInstance(dto);
  }
}
