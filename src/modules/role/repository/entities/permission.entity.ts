import { Entity, Column, ManyToMany } from "typeorm";
import { RoleEntity } from "./role.entity";
import { DatabasePostgresIDEntityAbstract } from "src/common/database/abstracts/postgres/entities/database.postgres.uuid.entity.abstract";
import {
  ENUM_POLICY_ACTION,
  ENUM_POLICY_SUBJECT,
} from "src/common/policy/constants/policy.enum.constant";

@Entity()
export class PermissionEntity extends DatabasePostgresIDEntityAbstract {
  @Column({ enum: ENUM_POLICY_SUBJECT, type: "enum" })
  subject: ENUM_POLICY_SUBJECT;

  @Column({ enum: ENUM_POLICY_ACTION, type: "enum" })
  action: ENUM_POLICY_ACTION;

  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles: RoleEntity[];
}
