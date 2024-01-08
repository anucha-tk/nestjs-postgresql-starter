import {
  IDatabaseFindOneOptions,
  IDatabaseFindAll,
  IDatabaseGetTotal,
} from "src/common/database/interfaces/database.interface";
import { ApiKeyEntity } from "../repository/entities/api-key.entity";
import { IApiKeyCreated } from "./api-key.interface";
import { ApiKeyCreateDto, ApiKeyCreateRawDto } from "../dtos/api-key.create.dto";
import { ApiKeyUpdateDateDto } from "../dtos/api-key.update-date.dto";

export interface IApiKeyService {
  findOneByActiveKey(key: string, options?: IDatabaseFindOneOptions): Promise<ApiKeyEntity | null>;
  createHashApiKey(key: string, secret: string): Promise<string>;
  validateHashApiKey(hashFromRequest: string, hash: string): Promise<boolean>;
  findOneById(id: number, options?: IDatabaseFindOneOptions): Promise<ApiKeyEntity | null>;
  findAll(find?: IDatabaseFindAll): Promise<ApiKeyEntity[]>;
  deleteAll(): Promise<boolean>;
  createRaw(dto: ApiKeyCreateRawDto): Promise<IApiKeyCreated>;
  getTotal(find?: IDatabaseGetTotal): Promise<number>;
  createKey(): Promise<string>;
  createSecret(): Promise<string>;
  create({ name, type, startDate, endDate }: ApiKeyCreateDto): Promise<IApiKeyCreated>;
  reset(repository: ApiKeyEntity, secret: string): Promise<ApiKeyEntity>;
  active(repository: ApiKeyEntity): Promise<ApiKeyEntity>;
  inActive(repository: ApiKeyEntity): Promise<ApiKeyEntity>;
  sofDelete(id: number): Promise<boolean>;
  updateDate(
    repository: ApiKeyEntity,
    { startDate, endDate }: ApiKeyUpdateDateDto,
  ): Promise<ApiKeyEntity>;
  updateName(repository: ApiKeyEntity, name: string): Promise<ApiKeyEntity>;
}
