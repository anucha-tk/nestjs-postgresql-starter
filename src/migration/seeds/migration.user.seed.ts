import { Command } from "nestjs-command";
import { Injectable } from "@nestjs/common";
import { AuthService } from "src/common/auth/services/auth.service";
import { RoleService } from "src/modules/role/services/role.service";
import { ENUM_USER_SIGN_UP_FROM } from "src/modules/user/constants/user.enum.constant";
import { RoleEntity } from "src/modules/role/repository/entities/role.entity";
import { UserService } from "src/modules/user/services/user.service";

@Injectable()
export class MigrationUserSeed {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
  ) {}

  @Command({
    command: "seed:user",
    describe: "seed users",
  })
  async seeds(): Promise<void> {
    const password = "aaAA@@123444";
    const superadminRole: RoleEntity = await this.roleService.findOneByName("superadmin");
    const adminRole: RoleEntity = await this.roleService.findOneByName("admin");
    const memberRole: RoleEntity = await this.roleService.findOneByName("member");
    const userRole: RoleEntity = await this.roleService.findOneByName("user");
    const passwordHash = await this.authService.createPassword(password);
    const user1 = this.userService.create(
      {
        firstName: "superadmin",
        lastName: "test",
        email: "superadmin@mail.com",
        mobileNumber: "08111111222",
        signUpFrom: ENUM_USER_SIGN_UP_FROM.LOCAL,
        role: superadminRole,
      },
      passwordHash,
    );
    const user2 = this.userService.create(
      {
        firstName: "admin",
        lastName: "test",
        email: "admin@mail.com",
        signUpFrom: ENUM_USER_SIGN_UP_FROM.LOCAL,
        role: adminRole,
      },
      passwordHash,
    );
    const user3 = this.userService.create(
      {
        firstName: "user",
        lastName: "test",
        email: "user@mail.com",
        signUpFrom: ENUM_USER_SIGN_UP_FROM.LOCAL,
        role: userRole,
      },
      passwordHash,
    );
    const user4 = this.userService.create(
      {
        firstName: "member",
        lastName: "test",
        email: "member@mail.com",
        signUpFrom: ENUM_USER_SIGN_UP_FROM.LOCAL,
        role: memberRole,
      },
      passwordHash,
    );

    try {
      await Promise.all([user1, user2, user3, user4]);
    } catch (err: any) {
      throw new Error(err.message);
    }

    return;
  }

  @Command({
    command: "remove:user",
    describe: "remove users",
  })
  async remove(): Promise<void> {
    try {
      await this.userService.deleteAll();
    } catch (err: any) {
      throw new Error(err.message);
    }

    return;
  }
}
