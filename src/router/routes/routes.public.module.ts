import { Module } from "@nestjs/common";
import { AuthModule } from "src/common/auth/auth.module";
import { MessagePublicController } from "src/common/message/controllers/message.public.controller";
import { RoleModule } from "src/modules/role/role.module";
import { UserPublicController } from "src/modules/user/controllers/user.public.controller";
import { UserModule } from "src/modules/user/user.module";

@Module({
  controllers: [MessagePublicController, UserPublicController],
  providers: [],
  exports: [],
  imports: [RoleModule, AuthModule, UserModule],
})
export class RoutesPublicModule {}
