import { faker } from "@faker-js/faker";
import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

export class ResponseIdSerialization {
  @ApiProperty({
    description: "Id that representative with your target data",
    example: faker.number.int(100),
    required: true,
    nullable: false,
  })
  @Type(() => Number)
  @Expose()
  id: number;
}
