import { faker } from "@faker-js/faker";
import { ApiHideProperty, ApiProperty, OmitType } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import {
  ENUM_POLICY_REQUEST_ACTION,
  ENUM_POLICY_SUBJECT,
} from "src/common/policy/constants/policy.enum.constant";
import { ENUM_ROLE_TYPE } from "src/modules/role/constants/role.enum.constant";
import { ENUM_USER_SIGN_UP_FROM } from "../constants/user.enum.constant";
import { UserPayloadPermissionSerialization } from "./user.permission-payload.serialization";
import { UserProfileSerialization } from "./user.profile.serialization";
import { UserEntity } from "../repository/entities/user.entity";

export class UserPayloadSerialization extends OmitType(UserProfileSerialization, [
  "role",
  "signUpDate",
  "createdAt",
  "updatedAt",
  "signUpFrom",
] as const) {
  @ApiProperty({
    example: faker.number.int(10),
    type: "string",
    required: true,
    nullable: false,
  })
  @Transform(({ obj }) => `${obj.role.id}`)
  readonly role: number;

  @ApiProperty({
    example: ENUM_ROLE_TYPE.ADMIN,
    type: "string",
    enum: ENUM_ROLE_TYPE,
    required: true,
    nullable: false,
  })
  @Expose()
  @Transform(({ obj }) => obj.role.type)
  readonly type: ENUM_ROLE_TYPE;

  @ApiProperty({
    type: () => UserPayloadPermissionSerialization,
    isArray: true,
    required: true,
    nullable: false,
    example: [
      {
        subject: faker.helpers.arrayElement(Object.values(ENUM_POLICY_SUBJECT)),
        acton: "1,3",
      },
    ],
  })
  @Transform(({ obj }: { obj: UserEntity }) => {
    const transformedPermissions: Record<string, any>[] = [];

    obj.role.permissions.forEach((permission) => {
      const existingPermission = transformedPermissions.find(
        (item) => item.subject === permission.subject,
      );

      const actionEnumValue = ENUM_POLICY_REQUEST_ACTION[permission.action.toUpperCase()];

      if (typeof actionEnumValue !== "undefined") {
        const actionString = actionEnumValue.toString();
        if (existingPermission) {
          existingPermission.action = existingPermission.action.concat(",", actionString);
        } else {
          transformedPermissions.push({ subject: permission.subject, action: actionString });
        }
      }
    });

    return transformedPermissions;
  })
  @Expose()
  readonly permissions: UserPayloadPermissionSerialization[];

  @ApiHideProperty()
  @Exclude()
  readonly signUpDate: Date;

  @ApiHideProperty()
  @Exclude()
  readonly signUpFrom: ENUM_USER_SIGN_UP_FROM;

  @Exclude()
  readonly loginDate: Date;

  @ApiHideProperty()
  @Exclude()
  readonly createdAt: number;

  @ApiHideProperty()
  @Exclude()
  readonly updatedAt: number;
}
