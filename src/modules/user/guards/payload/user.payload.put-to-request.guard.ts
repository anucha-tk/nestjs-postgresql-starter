import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { IRequestApp } from "src/common/request/interfaces/request.interface";
import { UserService } from "src/modules/user/services/user.service";
import { UserEntity } from "../../repository/entities/user.entity";

/**
 * Guard get user from request app and put to `request.__user`
 * @argument  user is type UserDoc or undefined
 * @returns boolean
 * */
@Injectable()
export class UserPayloadPutToRequestGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestApp & { __user: UserEntity }>();
    const { user } = request;

    const check: UserEntity = await this.userService.joinWithRole(user.id);
    request.__user = check;

    return true;
  }
}
