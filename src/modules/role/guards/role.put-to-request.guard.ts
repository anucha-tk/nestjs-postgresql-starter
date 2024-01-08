import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { IRequestApp } from "src/common/request/interfaces/request.interface";
import { RoleService } from "../services/role.service";
import { RoleEntity } from "../repository/entities/role.entity";
import { Reflector } from "@nestjs/core";
import { ROLE_DELETED_META_KEY } from "../constants/role.constant";

/**
 * Get roleId from request params find and put to app request
 * @example
 *    use request.__role - can be undefined
 * */
@Injectable()
export class RolePutToRequestGuard implements CanActivate {
  constructor(private readonly roleService: RoleService, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestApp & { __role: RoleEntity }>();
    const withDeleted = this.reflector.getAllAndOverride<boolean>(ROLE_DELETED_META_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const { params } = request;
    const { role } = params;
    const check = await this.roleService.findOneWithPermissions(+role, { withDeleted });
    request.__role = check;

    return true;
  }
}
