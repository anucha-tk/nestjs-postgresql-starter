import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ENUM_DOC_REQUEST_BODY_TYPE } from "src/common/doc/constants/doc.enum.constant";
import {
  Doc,
  DocAuth,
  DocRequest,
  DocGuard,
  DocResponsePaging,
  DocErrorGroup,
  DocDefault,
  DocResponse,
  DocResponseId,
} from "src/common/doc/decorators/doc.decorator";
import {
  RoleDocParamsId,
  RoleDocQueryIsActive,
  RoleDocQueryType,
} from "src/modules/role/constants/role.doc.constant";
import { RoleListSerialization } from "src/modules/role/serializations/role.list.serialization";
import { ENUM_ROLE_STATUS_CODE_ERROR } from "../constants/role.status-code.constant";
import { RoleActiveSerialization } from "../serializations/role.active.serialization";
import { RoleGetSerialization } from "../serializations/role.get.serialization";
import { RoleInActiveSerialization } from "../serializations/role.inActive.serialization";
import { RoleUpdatePermissionsSerialization } from "../serializations/role.update-permissions.serialization";
import { RoleUpdateNameSerialization } from "../serializations/role.update-name.serialization";

export function RoleAdminListDoc(): MethodDecorator {
  return applyDecorators(
    Doc({
      operation: "modules.admin.role",
    }),
    DocRequest({
      queries: [...RoleDocQueryIsActive, ...RoleDocQueryType],
    }),
    DocAuth({
      apiKey: true,
      jwtAccessToken: true,
    }),
    DocGuard({ role: true, policy: true }),
    DocResponsePaging<RoleListSerialization>("role.list", {
      serialization: RoleListSerialization,
    }),
  );
}

export function RoleAdminGetDoc(): MethodDecorator {
  return applyDecorators(
    Doc({
      operation: "modules.admin.role",
    }),
    DocRequest({
      params: RoleDocParamsId,
    }),
    DocAuth({
      apiKey: true,
      jwtAccessToken: true,
    }),
    DocGuard({ role: true, policy: true }),
    DocResponse<RoleGetSerialization>("role.get", {
      serialization: RoleGetSerialization,
    }),
    DocErrorGroup([
      DocDefault({
        httpStatus: HttpStatus.NOT_FOUND,
        statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR,
        messagePath: "role.error.notFound",
      }),
    ]),
  );
}

export function RoleAdminCreateDoc(): MethodDecorator {
  return applyDecorators(
    Doc({
      operation: "modules.admin.role",
    }),
    DocRequest({
      bodyType: ENUM_DOC_REQUEST_BODY_TYPE.JSON,
    }),
    DocAuth({
      apiKey: true,
      jwtAccessToken: true,
    }),
    DocGuard({ role: true, policy: true }),
    DocResponseId("role.create"),
    DocErrorGroup([
      DocDefault({
        httpStatus: HttpStatus.BAD_REQUEST,
        statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_EXIST_ERROR,
        messagePath: "role.error.exist",
      }),
    ]),
  );
}

export function RoleAdminUpdateDoc(): MethodDecorator {
  return applyDecorators(
    Doc({
      operation: "modules.admin.role",
    }),
    DocRequest({
      params: RoleDocParamsId,
      bodyType: ENUM_DOC_REQUEST_BODY_TYPE.JSON,
    }),
    DocAuth({
      apiKey: true,
      jwtAccessToken: true,
    }),
    DocGuard({ role: true, policy: true }),
    DocResponse("role.update", { serialization: RoleUpdateNameSerialization }),
    DocErrorGroup([
      DocDefault({
        httpStatus: HttpStatus.NOT_FOUND,
        statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR,
        messagePath: "role.error.notFound",
      }),
      DocDefault({
        httpStatus: HttpStatus.CONFLICT,
        statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_EXIST_ERROR,
        messagePath: "role.error.exist",
      }),
    ]),
  );
}

export function RoleAdminDeleteDoc(): MethodDecorator {
  return applyDecorators(
    Doc({
      operation: "modules.admin.role",
    }),
    DocRequest({
      params: RoleDocParamsId,
    }),
    DocAuth({
      apiKey: true,
      jwtAccessToken: true,
    }),
    DocGuard({ role: true, policy: true }),
    DocResponseId("role.softDelete"),
    DocErrorGroup([
      DocDefault({
        httpStatus: HttpStatus.NOT_FOUND,
        statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR,
        messagePath: "role.error.notFound",
      }),
      DocDefault({
        httpStatus: HttpStatus.CONFLICT,
        statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_USED_ERROR,
        messagePath: "role.error.used",
      }),
    ]),
  );
}

export function RoleAdminInActiveDoc(): MethodDecorator {
  return applyDecorators(
    Doc({
      operation: "modules.admin.role",
    }),
    DocRequest({
      params: RoleDocParamsId,
    }),
    DocAuth({
      apiKey: true,
      jwtAccessToken: true,
    }),
    DocGuard({ role: true, policy: true }),
    DocResponse("role.inactive", { serialization: RoleInActiveSerialization }),
    DocErrorGroup([
      DocDefault({
        httpStatus: HttpStatus.NOT_FOUND,
        statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR,
        messagePath: "role.error.notFound",
      }),
      DocDefault({
        httpStatus: HttpStatus.BAD_REQUEST,
        statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_IS_ACTIVE_ERROR,
        messagePath: "role.error.isActiveInvalid",
      }),
    ]),
  );
}

export function RoleAdminActiveDoc(): MethodDecorator {
  return applyDecorators(
    Doc({
      operation: "modules.admin.role",
    }),
    DocRequest({
      params: RoleDocParamsId,
    }),
    DocAuth({
      apiKey: true,
      jwtAccessToken: true,
    }),
    DocGuard({ role: true, policy: true }),
    DocResponse("role.active", { serialization: RoleActiveSerialization }),
    DocErrorGroup([
      DocDefault({
        httpStatus: HttpStatus.NOT_FOUND,
        statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR,
        messagePath: "role.error.notFound",
      }),
      DocDefault({
        httpStatus: HttpStatus.BAD_REQUEST,
        statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_IS_ACTIVE_ERROR,
        messagePath: "role.error.isActiveInvalid",
      }),
    ]),
  );
}

export function RoleAdminUpdatePermissionDoc(): MethodDecorator {
  return applyDecorators(
    Doc({
      operation: "modules.admin.role",
    }),
    DocRequest({
      params: RoleDocParamsId,
      bodyType: ENUM_DOC_REQUEST_BODY_TYPE.JSON,
    }),
    DocAuth({
      apiKey: true,
      jwtAccessToken: true,
    }),
    DocGuard({ role: true, policy: true }),
    DocResponse("role.updatePermissions", { serialization: RoleUpdatePermissionsSerialization }),
    DocErrorGroup([
      DocDefault({
        httpStatus: HttpStatus.NOT_FOUND,
        statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR,
        messagePath: "role.error.notFound",
      }),
      DocDefault({
        httpStatus: HttpStatus.BAD_REQUEST,
        statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_IS_ACTIVE_ERROR,
        messagePath: "role.error.isActiveInvalid",
      }),
    ]),
  );
}

export function RoleAdminRestoreDoc(): MethodDecorator {
  return applyDecorators(
    Doc({
      operation: "modules.admin.role",
    }),
    DocRequest({
      params: RoleDocParamsId,
    }),
    DocAuth({
      apiKey: true,
      jwtAccessToken: true,
    }),
    DocGuard({ role: true, policy: true }),
    DocResponseId("role.restore"),
    DocErrorGroup([
      DocDefault({
        httpStatus: HttpStatus.NOT_FOUND,
        statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR,
        messagePath: "role.error.notFound",
      }),
    ]),
  );
}
