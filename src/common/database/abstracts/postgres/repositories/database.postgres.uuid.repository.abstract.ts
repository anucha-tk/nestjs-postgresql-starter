import {
  Brackets,
  DeepPartial,
  Entity,
  FindOperator,
  ILike,
  Repository,
  SelectQueryBuilder,
} from "typeorm";
import { DatabaseBaseRepositoryAbstract } from "../../database.base-repository.abstract";
import { InjectRepository } from "@nestjs/typeorm";
import {
  IDatabaseWithDeletedOptions,
  IDatabaseFindOneOptions,
  IDatabaseFindAll,
  IDatabaseGetTotal,
  IDatabaseFindOneLeftJoin,
} from "src/common/database/interfaces/database.interface";
import { ENUM_PAGINATION_ORDER_DIRECTION_TYPE } from "src/common/pagination/constants/pagination.enum.constant";

export abstract class DatabasePostgresIDRepositoryAbstract<
  Entity,
> extends DatabaseBaseRepositoryAbstract<Entity> {
  protected alias: string;
  protected _repository: Repository<Entity>;

  constructor(
    @InjectRepository(Entity)
    repository: Repository<Entity>,
  ) {
    super();
    this._repository = repository;
    this.alias = this._repository.createQueryBuilder().alias;
  }
  private getJoinedTables(queryBuilder: SelectQueryBuilder<Entity>): string[] {
    return queryBuilder.expressionMap.aliases.map((e) => e.name);
  }

  private isHasRelationAndJoinAndSelect(
    queryBuilder: SelectQueryBuilder<Entity>,
    key: string,
  ): void {
    const isHasRelation: boolean = queryBuilder.hasRelation(this.alias, key);
    const joins = this.getJoinedTables(queryBuilder);
    if (isHasRelation && !joins.includes(key)) {
      queryBuilder.leftJoinAndSelect(`${this.alias}.${key}`, key);
    }
  }

  async findAll(findAllOptions: IDatabaseFindAll): Promise<Entity[]> {
    const queryBuilder: SelectQueryBuilder<Entity> = this._repository.createQueryBuilder();

    if (findAllOptions?.options?.withDeleted) {
      queryBuilder.withDeleted();
    }

    if (findAllOptions?.options?.order) {
      const keys = Object.keys(findAllOptions?.options?.order);
      for (const key of keys) {
        const direction = findAllOptions?.options.order[key]
          .toString()
          .toUpperCase() as ENUM_PAGINATION_ORDER_DIRECTION_TYPE;

        if (Object.values(ENUM_PAGINATION_ORDER_DIRECTION_TYPE).includes(direction)) {
          queryBuilder.orderBy(`${this.alias}.${key}`, direction);
        }
      }
    }

    if (findAllOptions?.options?.paging) {
      queryBuilder.skip(findAllOptions?.options.paging.skip);
      queryBuilder.take(findAllOptions?.options.paging.take);
    }

    if (findAllOptions?.options?.relations) {
      const keys = Object.keys(findAllOptions?.options?.relations);
      for (const key of keys) {
        this.isHasRelationAndJoinAndSelect(queryBuilder, key);
      }
    }

    if (findAllOptions?.search) {
      this.applySearch(queryBuilder, findAllOptions?.search);
    }

    if (findAllOptions?.find) {
      queryBuilder.andWhere(findAllOptions?.find);
    } else {
      queryBuilder.andWhere({});
    }

    return queryBuilder.getMany();
  }

  async findOne(
    find: Record<string, any> = {},
    options?: IDatabaseFindOneOptions,
  ): Promise<Entity | null> {
    return this._repository.findOne({ where: find, ...options });
  }

  async findOneById(id: number, options?: IDatabaseFindOneOptions): Promise<Entity | null> {
    return this._repository.findOneBy({ id, ...options } as any);
  }

  async createInstance(data: DeepPartial<Entity>): Promise<Entity> {
    return this._repository.create(data);
  }

  async save(data: Entity): Promise<Entity> {
    return this._repository.save(data);
  }

  async exists(
    find: Record<string, any> = {},
    options?: IDatabaseWithDeletedOptions,
  ): Promise<boolean> {
    const result = await this._repository.findOne({
      where: find,
      withDeleted: options?.withDeleted,
    });
    return result ? true : false;
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this._repository.delete(id);
      return true;
    } catch (err: unknown) {
      throw err;
    }
  }

  async deleteMany(ids: number[]): Promise<boolean> {
    try {
      await this._repository.delete(ids);
      return true;
    } catch (err: unknown) {
      throw err;
    }
  }

  async deleteAll(): Promise<boolean> {
    try {
      await this._repository.createQueryBuilder().delete().execute();
      return true;
    } catch (err: unknown) {
      throw err;
    }
  }

  async createMany(data: Entity[]): Promise<boolean> {
    try {
      await this._repository.save(data);
      return true;
    } catch (err: unknown) {
      throw err;
    }
  }

  async findOneLeftJoin({ id, field, options }: IDatabaseFindOneLeftJoin): Promise<Entity> {
    const queryBuilder = this._repository.createQueryBuilder();

    queryBuilder.where({ id }).leftJoinAndSelect(`${this.alias}.${field}`, field);

    if (options?.withDeleted) {
      queryBuilder.withDeleted();
    }
    return queryBuilder.getOne();
  }

  /**
   * softDelete.
   * make deleteAt single entity
   *
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async softDelete(id: number): Promise<boolean> {
    try {
      await this._repository.softDelete(id);
      return true;
    } catch (err: unknown) {
      throw err;
    }
  }

  async restore(id: number): Promise<boolean> {
    try {
      await this._repository.restore(id);
      return true;
    } catch (err: unknown) {
      throw err;
    }
  }

  /**
   * softRemove.
   * make deleteAt all relation entity if define `cascade: true`
   * can use restore with recover
   *
   * @param {Entity} repository
   * @returns {Promise<boolean>}
   */
  async softRemove(repository: Entity): Promise<boolean> {
    try {
      await this._repository.softRemove(repository);
      return true;
    } catch (err: unknown) {
      throw err;
    }
  }

  /**
   * recover.
   * recover (removed deletedAt) all relation entity if define `cascade: true`
   *
   * @param {Entity} repository
   * @returns {Promise<boolean>}
   */
  async recover(repository: Entity): Promise<boolean> {
    try {
      await this._repository.recover(repository);
      return true;
    } catch (err: unknown) {
      throw err;
    }
  }

  async getTotal({ find = {}, search, options }: IDatabaseGetTotal): Promise<number> {
    const queryBuilder = this._repository.createQueryBuilder();

    if (options?.withDeleted) {
      queryBuilder.withDeleted();
    }

    if (search) {
      this.applySearch(queryBuilder, search);
    }

    queryBuilder.andWhere(find);

    return queryBuilder.getCount();
  }

  /**
   * applySearch
   * is search base form availableSearch on paginationSearch
   * can search to deep obj (level 2)
   * @example
   * Customer oneToOne Address
   *
   * // structure look like
   *
   * Customer {
   *   ...
   *   address: {
   *     ...
   *     district: 'abc'
   *     province: 'xyz'
   *   }
   * }
   *
   * // define here
   * export const CUSTOMER_DEFAULT_AVAILABLE_SEARCH = [
   *   "address.district",
   *   "address.province",
   * ]
   *
   * */
  private applySearch(
    queryBuilder: SelectQueryBuilder<Entity>,
    searchs: Record<string, any>[],
  ): void {
    const selfTables = searchs.filter(
      (e: Record<string, any>) => e[Object.keys(e)[0]] instanceof FindOperator,
    );
    const joinTables = searchs.filter(
      (e: Record<string, any>) => !(e[Object.keys(e)[0]] instanceof FindOperator),
    );

    for (const joinTable of joinTables) {
      for (const key in joinTable) {
        this.isHasRelationAndJoinAndSelect(queryBuilder, key);
      }
    }

    queryBuilder.where(
      new Brackets((qb) => {
        for (const selfTable of selfTables) {
          for (const key in selfTable) {
            const value = `%${selfTable[key]._value}%`;
            qb.orWhere({ [key]: ILike(value) });
          }
        }
        for (const joinTable of joinTables) {
          for (const key in joinTable) {
            for (const deepKey in joinTable[key]) {
              const value = `%${joinTable[key][deepKey]._value}%`;
              qb.orWhere(`${key}.${deepKey} ILIKE :${deepKey}`, {
                [deepKey]: value,
              });
            }
          }
        }
      }),
    );
  }
}
