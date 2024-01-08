import { DatabasePostgresIDEntityAbstract } from "src/common/database/abstracts/postgres/entities/database.postgres.uuid.entity.abstract";
import { Column, Entity, OneToMany } from "typeorm";
import { ENUM_API_KEY_TYPE } from "../../constants/api-key.enum.constant";
import { LoggerEntity } from "src/common/logger/repository/entities/logger.entity";

@Entity()
export class ApiKeyEntity extends DatabasePostgresIDEntityAbstract {
  @Column({
    type: "enum",
    enum: ENUM_API_KEY_TYPE,
  })
  type: ENUM_API_KEY_TYPE;

  @Column({
    length: 100,
    transformer: {
      to: (value) => (typeof value === "string" ? value.toLowerCase() : value),
      from: (value) => value,
    },
  })
  name: string;

  @Column({
    unique: true,
  })
  key: string;

  @Column()
  hash: string;

  @Column({
    type: "boolean",
  })
  isActive: boolean;

  @Column({
    nullable: true,
    type: "date",
  })
  startDate?: Date;

  @Column({
    nullable: true,
    type: "date",
  })
  endDate?: Date;

  @OneToMany(() => LoggerEntity, (loggerEntity) => loggerEntity.apiKey)
  logger?: LoggerEntity;
}
