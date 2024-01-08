import { ApiProperty, OmitType } from "@nestjs/swagger";
import { UserCreateDto } from "./user.create.dto";
import { Type } from "class-transformer";

export class UserCreateRoleIdDto extends OmitType(UserCreateDto, ["role"]) {
  @ApiProperty({
    example: 1,
    required: true,
    nullable: false,
  })
  @Type(() => Number)
  readonly role: number;
}
