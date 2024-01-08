import { DatabasePostgresIDEntityAbstract } from "src/common/database/abstracts/postgres/entities/database.postgres.uuid.entity.abstract";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { ENUM_USER_SIGN_UP_FROM } from "../../constants/user.enum.constant";
import { RoleEntity } from "src/modules/role/repository/entities/role.entity";

@Entity()
export class UserEntity extends DatabasePostgresIDEntityAbstract {
  @Column({
    nullable: true,
    unique: true,
    length: 100,
    transformer: {
      to: (value) => (typeof value === "string" ? value.toLowerCase() : value),
      from: (value) => value,
    },
  })
  username?: string;

  @Column({
    length: 50,
    transformer: {
      to: (value) => (typeof value === "string" ? value.toLowerCase() : value),
      from: (value) => value,
    },
  })
  firstName: string;

  @Column({
    transformer: {
      to: (value) => (typeof value === "string" ? value.toLowerCase() : value),
      from: (value) => value,
    },
    length: 50,
  })
  lastName: string;

  @Column({
    nullable: true,
    unique: true,
    length: 15,
  })
  mobileNumber?: string;

  @Column({
    unique: true,
    transformer: {
      to: (value) => (typeof value === "string" ? value.toLowerCase() : value),
      from: (value) => value,
    },
    length: 100,
  })
  email: string;

  @ManyToOne(() => RoleEntity, (roleEntity) => roleEntity.user, { nullable: false })
  @JoinColumn()
  role: RoleEntity;

  @Column()
  password: string;

  @Column({ type: "date" })
  passwordExpired: Date;

  @Column({ type: "date" })
  passwordCreated: Date;

  @Column({
    default: 0,
  })
  passwordAttempt: number;

  @Column({
    type: "date",
  })
  signUpDate: Date;

  @Column({
    type: "enum",
    enum: ENUM_USER_SIGN_UP_FROM,
  })
  signUpFrom: ENUM_USER_SIGN_UP_FROM;

  @Column()
  salt: string;

  @Column({
    default: true,
    type: "boolean",
  })
  isActive: boolean;

  @Column({
    default: false,
    type: "boolean",
  })
  inactivePermanent: boolean;

  @Column({
    nullable: true,
    type: "date",
  })
  inactiveDate?: Date;

  @Column({
    default: false,
    type: "boolean",
  })
  blocked: boolean;

  @Column({
    nullable: true,
    type: "date",
  })
  blockedDate?: Date;

  // TODO: check
  @Column({ nullable: true })
  googleAccessToken?: string;

  @Column({ nullable: true })
  googleRefreshToken?: string;
}
