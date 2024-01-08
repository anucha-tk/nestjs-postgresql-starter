import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from "@nestjs/common";
import { IRequestApp } from "src/common/request/interfaces/request.interface";
import { ROLE_DELETED_META_KEY, ROLE_IS_ACTIVE_META_KEY } from "../constants/role.constant";
import { RoleActiveGuard } from "../guards/role.active.guard";
import { RoleNotFoundGuard } from "../guards/role.not-found.guard";
import { RolePutToRequestGuard } from "../guards/role.put-to-request.guard";
import { RoleEntity } from "../repository/entities/role.entity";
import { RoleDeletedGuard } from "../guards/role.delete.guard";

/**
 * Get `__role`
 * @param {boolean} returnPlain return toObject()
 * @return RoleDoc or RoleEntity
 */
export const GetRole = createParamDecorator((_, ctx: ExecutionContext): RoleEntity => {
  const { __role } = ctx.switchToHttp().getRequest<IRequestApp & { __role: RoleEntity }>();
  return __role;
});

export function RoleGetGuard(): MethodDecorator {
  return applyDecorators(UseGuards(RolePutToRequestGuard, RoleNotFoundGuard));
}

export function RoleUpdateGuard(): MethodDecorator {
  return applyDecorators(UseGuards(RolePutToRequestGuard, RoleNotFoundGuard));
}

export function RoleUpdatePermissionsGuard(): MethodDecorator {
  return applyDecorators(
    UseGuards(RolePutToRequestGuard, RoleNotFoundGuard, RoleActiveGuard),
    SetMetadata(ROLE_IS_ACTIVE_META_KEY, [true]),
  );
}

export function RoleInActiveGuard(): MethodDecorator {
  return applyDecorators(
    UseGuards(RolePutToRequestGuard, RoleNotFoundGuard, RoleActiveGuard),
    SetMetadata(ROLE_IS_ACTIVE_META_KEY, [true]),
  );
}

export function RoleCheckActiveGuard(): MethodDecorator {
  return applyDecorators(
    UseGuards(RolePutToRequestGuard, RoleNotFoundGuard, RoleActiveGuard),
    SetMetadata(ROLE_IS_ACTIVE_META_KEY, [false]),
  );
}

export function RoleRestoreGuard(): MethodDecorator {
  return applyDecorators(
    UseGuards(RolePutToRequestGuard, RoleNotFoundGuard, RoleDeletedGuard),
    SetMetadata(ROLE_DELETED_META_KEY, true),
  );
}
