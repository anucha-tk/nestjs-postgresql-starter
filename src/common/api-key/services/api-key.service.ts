import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HelperDateService } from "src/common/helper/services/helper.date.service";
import { HelperHashService } from "src/common/helper/services/helper.hash.service";
import { HelperStringService } from "src/common/helper/services/helper.string.service";
import { IApiKeyService } from "../interfaces/api-key.service.interface";
import { ApiKeyRepository } from "../repository/repositories/api-key.repository";
import {
  IDatabaseFindOneOptions,
  IDatabaseFindAll,
  IDatabaseGetTotal,
} from "src/common/database/interfaces/database.interface";
import { ApiKeyEntity } from "../repository/entities/api-key.entity";
import { IApiKeyCreated } from "../interfaces/api-key.interface";
import { ApiKeyCreateDto, ApiKeyCreateRawDto } from "../dtos/api-key.create.dto";
import { ApiKeyUpdateDateDto } from "../dtos/api-key.update-date.dto";

@Injectable()
export class ApiKeyService implements IApiKeyService {
  private readonly env: string;

  constructor(
    private readonly apiKeyRepository: ApiKeyRepository,
    private readonly helperStringService: HelperStringService,
    private readonly helperHashService: HelperHashService,
    private readonly helperDateService: HelperDateService,
    private readonly configService: ConfigService,
  ) {
    this.env = this.configService.get<string>("app.env");
  }

  async findOneByActiveKey(
    key: string,
    options?: IDatabaseFindOneOptions,
  ): Promise<ApiKeyEntity | null> {
    return this.apiKeyRepository.findOne({ key, isActive: true }, options);
  }

  async createHashApiKey(key: string, secret: string): Promise<string> {
    return this.helperHashService.sha256(`${key}:${secret}`);
  }

  async validateHashApiKey(hashFromRequest: string, hash: string): Promise<boolean> {
    return this.helperHashService.sha256Compare(hashFromRequest, hash);
  }

  async findOneById(id: number, options?: IDatabaseFindOneOptions): Promise<ApiKeyEntity | null> {
    return this.apiKeyRepository.findOneById(id, options);
  }

  async findAll(find?: IDatabaseFindAll): Promise<ApiKeyEntity[]> {
    return this.apiKeyRepository.findAll(find);
  }

  async deleteAll(): Promise<boolean> {
    return this.apiKeyRepository.deleteAll();
  }

  async createRaw({
    name,
    key,
    type,
    secret,
    startDate,
    endDate,
  }: ApiKeyCreateRawDto): Promise<IApiKeyCreated> {
    const hash: string = await this.createHashApiKey(key, secret);

    const dto: ApiKeyEntity = new ApiKeyEntity();
    dto.name = name;
    dto.key = key;
    dto.hash = hash;
    dto.isActive = true;
    dto.type = type;

    if (startDate && endDate) {
      dto.startDate = this.helperDateService.startOfDay(startDate);
      dto.endDate = this.helperDateService.endOfDay(endDate);
    }

    const created: ApiKeyEntity = await this.apiKeyRepository.save(dto);

    return { doc: created, secret };
  }

  async getTotal(find?: IDatabaseGetTotal): Promise<number> {
    return this.apiKeyRepository.getTotal(find);
  }

  async createKey(): Promise<string> {
    return this.helperStringService.random(25, {
      safe: false,
      upperCase: true,
      prefix: `${this.env}_`,
    });
  }

  async createSecret(): Promise<string> {
    return this.helperStringService.random(35, {
      safe: false,
      upperCase: true,
    });
  }

  async create({ name, type, startDate, endDate }: ApiKeyCreateDto): Promise<IApiKeyCreated> {
    const key = await this.createKey();
    const secret = await this.createSecret();
    const hash: string = await this.createHashApiKey(key, secret);

    const dto: ApiKeyEntity = new ApiKeyEntity();
    dto.name = name;
    dto.key = key;
    dto.hash = hash;
    dto.isActive = true;
    dto.type = type;

    if (startDate && endDate) {
      dto.startDate = this.helperDateService.startOfDay(startDate);
      dto.endDate = this.helperDateService.endOfDay(endDate);
    }

    const created: ApiKeyEntity = await this.apiKeyRepository.save(dto);

    return { doc: created, secret };
  }

  async reset(repository: ApiKeyEntity, secret: string): Promise<ApiKeyEntity> {
    const hash: string = await this.createHashApiKey(repository.key, secret);
    repository.hash = hash;

    return this.apiKeyRepository.save(repository);
  }

  async active(repository: ApiKeyEntity): Promise<ApiKeyEntity> {
    repository.isActive = true;

    return this.apiKeyRepository.save(repository);
  }

  async inActive(repository: ApiKeyEntity): Promise<ApiKeyEntity> {
    repository.isActive = false;

    return this.apiKeyRepository.save(repository);
  }

  async sofDelete(id: number): Promise<boolean> {
    return this.apiKeyRepository.softDelete(id);
  }
  async updateDate(
    repository: ApiKeyEntity,
    { startDate, endDate }: ApiKeyUpdateDateDto,
  ): Promise<ApiKeyEntity> {
    repository.startDate = this.helperDateService.startOfDay(startDate);
    repository.endDate = this.helperDateService.endOfDay(endDate);

    return this.apiKeyRepository.save(repository);
  }

  async updateName(repository: ApiKeyEntity, name: string): Promise<ApiKeyEntity> {
    repository.name = name;

    return this.apiKeyRepository.save(repository);
  }
}
