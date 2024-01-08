import { ApiHideProperty, OmitType } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { PermissionSerialization, RoleGetSerialization } from "./role.get.serialization";
import { ENUM_ROLE_TYPE } from "../constants/role.enum.constant";

export class RoleUpdateNameSerialization extends OmitType(RoleGetSerialization, [
  "type",
  "permissions",
  "isActive",
  "createdAt",
  "updatedAt",
]) {
  @ApiHideProperty()
  @Exclude()
  readonly type: ENUM_ROLE_TYPE;

  @ApiHideProperty()
  @Exclude()
  readonly permissions: PermissionSerialization;

  @ApiHideProperty()
  @Exclude()
  readonly isActive: string;

  @ApiHideProperty()
  @Exclude()
  readonly createdAt: Date;

  @ApiHideProperty()
  @Exclude()
  readonly updatedAt: Date;
}
