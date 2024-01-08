import { Exclude } from "class-transformer";
import { RoleCreateDto } from "./role.create.dto";
import { OmitType } from "@nestjs/swagger";

export class RoleUpdateNameDto extends OmitType(RoleCreateDto, ["permissions", "type"] as const) {
  @Exclude()
  readonly permissions?: string;

  @Exclude()
  readonly type?: string;
}
