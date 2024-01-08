import { faker } from "@faker-js/faker";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MaxLength,
  MinLength,
  IsOptional,
  ValidateIf,
  IsEnum,
} from "class-validator";
import { RoleEntity } from "src/modules/role/repository/entities/role.entity";
import { ENUM_USER_SIGN_UP_FROM } from "src/modules/user/constants/user.enum.constant";

export class UserCreateDto {
  @ApiProperty({
    example: faker.internet.email(),
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  @Type(() => String)
  readonly email: string;

  @ApiProperty({
    example: faker.person.firstName(),
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  @Type(() => String)
  @Transform(({ value }) => value.toLowerCase())
  readonly firstName: string;

  @ApiProperty({
    example: faker.person.middleName(),
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  @Type(() => String)
  @Transform(({ value }) => (value ? value.toLowerCase() : null))
  readonly userName?: string;

  @ApiProperty({
    example: faker.person.lastName(),
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  @Type(() => String)
  @Transform(({ value }) => value.toLowerCase())
  readonly lastName: string;

  @ApiProperty({
    example: faker.phone.number("62812#########"),
    required: true,
  })
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(14)
  @ValidateIf((e) => e.mobileNumber !== "")
  @Type(() => String)
  readonly mobileNumber?: string;

  @ApiProperty({
    example: faker.number.int(100),
    required: true,
  })
  @IsNotEmpty()
  readonly role: RoleEntity;

  @ApiProperty({
    description: "string password",
    example: `${faker.string.alphanumeric(5).toLowerCase()}${faker.string
      .alphanumeric(5)
      .toUpperCase()}@@!123`,
    required: true,
  })
  @IsNotEmpty()
  @MaxLength(50)
  readonly password: string;

  @ApiProperty({
    description: "user signup from",
    example: ENUM_USER_SIGN_UP_FROM.LOCAL,
    nullable: false,
    required: true,
  })
  @IsEnum(ENUM_USER_SIGN_UP_FROM)
  @IsString()
  @IsNotEmpty()
  readonly signUpFrom: ENUM_USER_SIGN_UP_FROM;
}
