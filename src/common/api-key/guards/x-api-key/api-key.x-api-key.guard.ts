import { AuthGuard } from "@nestjs/passport";
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { HelperNumberService } from "src/common/helper/services/helper.number.service";
import { ENUM_API_KEY_STATUS_CODE_ERROR } from "src/common/api-key/constants/api-key.status-code.constant";
import { BadRequestError } from "passport-headerapikey";

@Injectable()
export class ApiKeyXApiKeyGuard extends AuthGuard("api-key") {
  constructor(private readonly helperNumberService: HelperNumberService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<IApiKeyPayload = any>(
    err: Record<string, any>,
    apiKey: IApiKeyPayload,
    info: Error | string,
  ): IApiKeyPayload {
    const {
      API_KEY_NEEDED_ERROR,
      API_KEY_INVALID_ERROR,
      API_KEY_NOT_FOUND_ERROR,
      API_KEY_IS_ACTIVE_ERROR,
      API_KEY_NOT_ACTIVE_YET_ERROR,
      API_KEY_EXPIRED_ERROR,
    } = ENUM_API_KEY_STATUS_CODE_ERROR;

    if (err || !apiKey) {
      if (info instanceof BadRequestError && info.message === "Missing API Key") {
        throw new UnauthorizedException({
          statusCode: API_KEY_NEEDED_ERROR,
          message: "apiKey.error.keyNeeded",
        });
      } else if (err) {
        const statusCode: number = this.helperNumberService.create(err.message as string);

        switch (statusCode) {
          case API_KEY_NOT_FOUND_ERROR:
            throw new ForbiddenException({
              statusCode,
              message: "apiKey.error.notFound",
            });
          case API_KEY_IS_ACTIVE_ERROR:
            throw new ForbiddenException({
              statusCode,
              message: "apiKey.error.inactive",
            });
          case API_KEY_NOT_ACTIVE_YET_ERROR:
            throw new ForbiddenException({
              statusCode,
              message: "apiKey.error.notActiveYet",
            });
          case API_KEY_EXPIRED_ERROR:
            throw new ForbiddenException({
              statusCode,
              message: "apiKey.error.expired",
            });
        }
      }

      throw new UnauthorizedException({
        statusCode: API_KEY_INVALID_ERROR,
        message: "apiKey.error.invalid",
      });
    }

    return apiKey;
  }
}
