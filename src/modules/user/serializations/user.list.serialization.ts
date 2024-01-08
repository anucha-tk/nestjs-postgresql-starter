import { ApiHideProperty, ApiProperty, OmitType } from "@nestjs/swagger";
import { Exclude, Type } from "class-transformer";
import { RoleListSerialization } from "src/modules/role/serializations/role.list.serialization";
import { UserProfileSerialization } from "src/modules/user/serializations/user.profile.serialization";

class RoleListWithOutPermissionSerialization extends OmitType(RoleListSerialization, [
  "permissions",
]) {
  @Exclude()
  permissions: number;
}

export class UserListSerialization extends OmitType(UserProfileSerialization, [
  "signUpDate",
  "signUpFrom",
  "role",
] as const) {
  @ApiProperty({
    type: () => RoleListWithOutPermissionSerialization,
    required: true,
    nullable: false,
  })
  @Type(() => RoleListWithOutPermissionSerialization)
  readonly role: RoleListWithOutPermissionSerialization;

  @ApiHideProperty()
  @Exclude()
  readonly signUpDate: Date;
}
