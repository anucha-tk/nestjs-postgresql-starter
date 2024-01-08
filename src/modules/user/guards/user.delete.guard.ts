import { Injectable, CanActivate, ExecutionContext, NotFoundException } from "@nestjs/common";
import { IRequestApp } from "src/common/request/interfaces/request.interface";
import { ENUM_USER_STATUS_CODE_ERROR } from "src/modules/user/constants/user.status-code.constant";
import { UserEntity } from "../repository/entities/user.entity";

/**
 * Guard 404 when `request.__user.deletedAt` is not exist
 * */
@Injectable()
export class UserDeletedGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { __user } = context.switchToHttp().getRequest<IRequestApp & { __user: UserEntity }>();

    if (!__user.deletedAt) {
      throw new NotFoundException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_NOT_FOUND_ERROR,
        message: "user.error.notFound",
      });
    }

    return true;
  }
}
