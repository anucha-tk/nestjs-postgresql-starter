import { DatabasePostgresIDEntityAbstract } from "src/common/database/abstracts/postgres/entities/database.postgres.uuid.entity.abstract";
import { ENUM_ROLE_TYPE } from "src/modules/role/constants/role.enum.constant";
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { PermissionEntity } from "./permission.entity";
import { UserEntity } from "src/modules/user/repository/entities/user.entity";

@Entity()
export class RoleEntity extends DatabasePostgresIDEntityAbstract {
  @Column({
    unique: true,
    length: 30,
  })
  name: string;

  @Column({
    type: "text",
    nullable: true,
  })
  description?: string;

  @Column({
    default: true,
  })
  isActive: boolean;

  @Column({
    enum: ENUM_ROLE_TYPE,
    type: "enum",
  })
  type: ENUM_ROLE_TYPE;

  @ManyToMany(() => PermissionEntity, (permissionEntity) => permissionEntity.roles)
  @JoinTable()
  permissions: PermissionEntity[];

  @OneToMany(() => UserEntity, (userEntity) => userEntity.role)
  user: UserEntity;
}
