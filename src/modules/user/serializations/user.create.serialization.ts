import { ApiProperty, OmitType } from "@nestjs/swagger";
import { Exclude, Transform } from "class-transformer";
import { UserGetSerialization } from "./user.get.serialization";
import { RoleEntity } from "src/modules/role/repository/entities/role.entity";

export class UserCreateSerialization extends OmitType(UserGetSerialization, [
  "role",
  "passwordAttempt",
  "inactiveDate",
  "blockedDate",
]) {
  @ApiProperty({
    example: 1,
    type: "string",
    required: true,
    nullable: false,
  })
  @Transform(({ value }: { value: RoleEntity }) => (value ? value.id : undefined))
  readonly role: number;

  @Exclude()
  readonly passwordAttempt: number;

  @Exclude()
  readonly inactiveDate: Date;

  @Exclude()
  readonly blockedDate: Date;
}
