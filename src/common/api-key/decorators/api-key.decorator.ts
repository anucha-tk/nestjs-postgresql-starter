import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from "@nestjs/common";
import { IRequestApp } from "src/common/request/interfaces/request.interface";
import { API_KEY_TYPE_META_KEY } from "../constants/api-key.constant";
import { ENUM_API_KEY_TYPE } from "../constants/api-key.enum.constant";
import { ApiKeyPayloadTypeGuard } from "../guards/payload/api-key.payload.type.guard";
import { ApiKeyXApiKeyGuard } from "../guards/x-api-key/api-key.x-api-key.guard";
import { ApiKeyEntity } from "../repository/entities/api-key.entity";

export function ApiKeyPublicProtected() {
  return applyDecorators(
    UseGuards(ApiKeyXApiKeyGuard, ApiKeyPayloadTypeGuard),
    SetMetadata(API_KEY_TYPE_META_KEY, [ENUM_API_KEY_TYPE.PUBLIC]),
  );
}

/**
 * Get `__apiKey`
 * @param {boolean} returnPlain return toObject()
 * @return ApiKeyDoc | ApiKeyEntity
 */
export const GetApiKey = createParamDecorator((_, ctx: ExecutionContext): ApiKeyEntity => {
  const { __apiKey } = ctx.switchToHttp().getRequest<IRequestApp & { __apiKey: ApiKeyEntity }>();
  return __apiKey;
});
