import { DeepPartial } from "typeorm";
import {
  IDatabaseWithDeletedOptions,
  IDatabaseFindOneOptions,
  IDatabaseFindAll,
  IDatabaseGetTotal,
  IDatabaseFindOneLeftJoin,
} from "../interfaces/database.interface";
export abstract class DatabaseBaseRepositoryAbstract<Entity> {
  abstract findAll(findAllOptions: IDatabaseFindAll): Promise<Entity[]>;
  abstract findOne(
    find: Record<string, any>,
    options?: IDatabaseFindOneOptions,
  ): Promise<Entity | null>;
  abstract exists(
    find: Record<string, any>,
    options?: IDatabaseWithDeletedOptions,
  ): Promise<boolean>;
  abstract save(data: Entity): Promise<Entity>;
  abstract createMany(data: Entity[]): Promise<boolean>;
  abstract findOneById(id: number, options?: IDatabaseFindOneOptions): Promise<Entity | null>;
  abstract delete(id: number): Promise<boolean>;
  abstract deleteMany(ids: number[]): Promise<boolean>;
  abstract deleteAll(): Promise<boolean>;
  abstract findOneLeftJoin(find: IDatabaseFindOneLeftJoin): Promise<Entity>;
  abstract softDelete(id: number): Promise<boolean>;
  abstract restore(id: number): Promise<boolean>;
  abstract getTotal(find: IDatabaseGetTotal): Promise<number>;
  abstract createInstance(data: DeepPartial<Entity>): Promise<Entity>;
  abstract softRemove(repository: Entity): Promise<boolean>;
  abstract recover(repository: Entity): Promise<boolean>;
}
