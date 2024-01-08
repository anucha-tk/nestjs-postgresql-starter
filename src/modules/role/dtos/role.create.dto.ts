import { faker } from "@faker-js/faker";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { ENUM_ROLE_TYPE } from "../constants/role.enum.constant";
import { RoleUpdateDescriptionDto } from "./role.update-description.dto";
import {
  ENUM_POLICY_ACTION,
  ENUM_POLICY_SUBJECT,
} from "src/common/policy/constants/policy.enum.constant";

export class RolePermissionsDto {
  @ApiProperty({
    required: true,
    description: "Permission subject",
    enum: ENUM_POLICY_SUBJECT,
    example: faker.helpers.arrayElement(Object.values(ENUM_POLICY_SUBJECT)),
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(ENUM_POLICY_SUBJECT)
  subject: ENUM_POLICY_SUBJECT;

  @ApiProperty({
    required: true,
    description: "Permission action base on subject",
    isArray: true,
    default: [],
    enum: ENUM_POLICY_ACTION,
    example: faker.helpers.arrayElements(Object.values(ENUM_POLICY_ACTION)),
  })
  @IsString({ each: true })
  @IsEnum(ENUM_POLICY_ACTION, { each: true })
  @IsArray()
  @ArrayUnique()
  action: ENUM_POLICY_ACTION[];
}

export class RoleCreateDto extends PartialType(RoleUpdateDescriptionDto) {
  @ApiProperty({
    description: "Name of role",
    example: faker.person.jobTitle(),
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  @Type(() => String)
  readonly name: string;

  @ApiProperty({
    description: "Representative for role type",
    example: "ADMIN",
    required: true,
  })
  @IsEnum(ENUM_ROLE_TYPE)
  @IsNotEmpty()
  readonly type: ENUM_ROLE_TYPE;

  @ApiProperty({
    required: true,
    description: "Permission list of role",
    isArray: true,
    default: [],
    example: [
      {
        subject: faker.helpers.arrayElement(Object.values(ENUM_POLICY_SUBJECT)),
        action: faker.helpers.arrayElements(Object.values(ENUM_POLICY_ACTION)),
      },
    ],
    type: () => RolePermissionsDto,
  })
  @ValidateNested({ each: true })
  @Type(() => RolePermissionsDto)
  @IsNotEmpty()
  readonly permissions: RolePermissionsDto[];
}
