import { DatabasePostgresIDEntityAbstract } from "src/common/database/abstracts/postgres/entities/database.postgres.uuid.entity.abstract";
import { Column, Entity, ManyToOne } from "typeorm";
import { ENUM_LOGGER_ACTION, ENUM_LOGGER_LEVEL } from "../../constants/logger.enum.constant";
import { ENUM_REQUEST_METHOD } from "src/common/request/constants/request.enum.constant";
import { ENUM_ROLE_TYPE } from "src/modules/role/constants/role.enum.constant";
import { ApiKeyEntity } from "src/common/api-key/repository/entities/api-key.entity";

@Entity()
export class LoggerEntity extends DatabasePostgresIDEntityAbstract {
  @Column("enum", {
    enum: ENUM_LOGGER_LEVEL,
  })
  level: string;

  @Column("enum", {
    enum: ENUM_LOGGER_ACTION,
  })
  action: string;

  @Column("enum", {
    enum: ENUM_REQUEST_METHOD,
  })
  method: string;

  @Column({
    nullable: true,
  })
  requestId?: string;

  @Column({
    nullable: true,
  })
  user?: number;

  @Column({
    nullable: true,
  })
  role?: number;

  @ManyToOne(() => ApiKeyEntity, (apiKeyEntity) => apiKeyEntity.logger)
  apiKey?: ApiKeyEntity;

  @Column({
    default: true,
    type: "boolean",
  })
  anonymous: boolean;

  @Column({
    nullable: true,
    enum: ENUM_ROLE_TYPE,
    type: "enum",
  })
  type?: ENUM_ROLE_TYPE;

  @Column({})
  description: string;

  @Column({
    nullable: true,
    type: "jsonb",
  })
  params?: Record<string, any>;

  @Column({
    nullable: true,
    type: "jsonb",
  })
  bodies?: Record<string, any>;

  @Column({
    nullable: true,
  })
  statusCode?: number;

  @Column({
    nullable: true,
  })
  path?: string;

  @Column("text", { array: true })
  tags: string[];
}
