import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { ApiKeyService } from "src/common/api-key/services/api-key.service";

/**
 * Guard get apiKey from params request and findOneById then put to request
 * @example
 * ```ts
 * request.__apiKey - can undefined
 * ```
 */
@Injectable()
export class ApiKeyPutToRequestGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { params } = request;
    const { apiKey } = params;

    const check = await this.apiKeyService.findOneById(apiKey);
    request.__apiKey = check;

    return true;
  }
}
