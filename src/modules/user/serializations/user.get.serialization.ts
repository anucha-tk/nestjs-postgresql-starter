import { faker } from "@faker-js/faker";
import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { Exclude, Transform, Type } from "class-transformer";
import { ResponseIdSerialization } from "src/common/response/serializations/response.id.serialization";
import { RoleGetSerialization } from "src/modules/role/serializations/role.get.serialization";
import { ENUM_USER_SIGN_UP_FROM } from "src/modules/user/constants/user.enum.constant";

export class UserGetSerialization extends ResponseIdSerialization {
  @ApiProperty({
    required: true,
    nullable: false,
    type: () => RoleGetSerialization,
  })
  @Type(() => RoleGetSerialization)
  readonly role: RoleGetSerialization;

  @ApiProperty({
    example: faker.internet.userName(),
    nullable: true,
    required: false,
  })
  @Transform(({ value }) => (value !== null ? value : undefined))
  readonly username?: string;

  @ApiProperty({
    required: true,
    nullable: false,
    example: faker.internet.email(),
  })
  readonly email: string;

  @ApiProperty({
    nullable: true,
    required: false,
    example: faker.phone.number("##########"),
  })
  @Transform(({ value }) => (value !== null ? value : undefined))
  readonly mobileNumber?: string;

  @ApiProperty({
    required: true,
    nullable: false,
    example: true,
  })
  readonly isActive: boolean;

  @ApiProperty({
    required: true,
    nullable: false,
    example: true,
  })
  readonly inactivePermanent: boolean;

  @ApiProperty({
    nullable: true,
    required: false,
    example: faker.date.recent(),
  })
  @Transform(({ value }) => (value !== null ? value : undefined))
  readonly inactiveDate?: Date;

  @ApiProperty({
    required: true,
    nullable: false,
    example: false,
  })
  readonly blocked: boolean;

  @ApiProperty({
    nullable: true,
    required: false,
    example: faker.date.recent(),
  })
  @Transform(({ value }) => (value !== null ? value : undefined))
  readonly blockedDate?: Date;

  @ApiProperty({
    required: true,
    nullable: false,
    example: faker.person.firstName(),
  })
  readonly firstName: string;

  @ApiProperty({
    required: true,
    nullable: false,
    example: faker.person.lastName(),
  })
  readonly lastName: string;

  @ApiHideProperty()
  @Exclude()
  readonly password: string;

  @ApiProperty({
    required: true,
    nullable: false,
    example: faker.date.future(),
  })
  readonly passwordExpired: Date;

  @ApiProperty({
    required: true,
    nullable: false,
    example: faker.date.past(),
  })
  readonly passwordCreated: Date;

  @ApiProperty({
    required: true,
    nullable: false,
    example: "0",
  })
  readonly passwordAttempt: number;

  @ApiProperty({
    required: true,
    nullable: false,
    example: faker.date.recent(),
  })
  readonly signUpDate: Date;

  @ApiProperty({
    required: true,
    nullable: false,
    example: ENUM_USER_SIGN_UP_FROM.LOCAL,
  })
  readonly signUpFrom: ENUM_USER_SIGN_UP_FROM;

  @ApiHideProperty()
  @Exclude()
  readonly salt: string;

  @ApiProperty({
    description: "Date created at",
    example: faker.date.recent(),
    required: true,
    nullable: false,
  })
  readonly createdAt: Date;

  @ApiProperty({
    description: "Date updated at",
    example: faker.date.recent(),
    required: true,
    nullable: false,
  })
  readonly updatedAt: Date;

  @ApiHideProperty()
  @Exclude()
  @Transform(({ value }) => (value !== null ? value : undefined))
  readonly googleAccessToken?: string;

  @ApiHideProperty()
  @Exclude()
  @Transform(({ value }) => (value !== null ? value : undefined))
  readonly googleRefreshToken?: string;

  @ApiHideProperty()
  @Exclude()
  readonly deletedAt?: Date;
}
