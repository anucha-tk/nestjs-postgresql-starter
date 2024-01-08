import { IPaginationOptions } from "src/common/pagination/interfaces/pagination.interface";

export interface IDatabaseFindOneOptions {
  select?: Record<string, any>;
  relations?: Record<string, any>;
  withDeleted?: boolean;
}

export type IDatabaseWithDeletedOptions = Pick<IDatabaseFindOneOptions, "withDeleted">;

export interface IDatabaseFindAllOptions
  extends Pick<IDatabaseFindOneOptions, "withDeleted" | "relations">,
    IPaginationOptions {}

export type IDatabaseFindAll = {
  find?: Record<string, any>;
  search?: Record<string, any>[];
  options?: IDatabaseFindAllOptions;
};

export type IDatabaseGetTotal = {
  find: Record<string, any>;
  search?: Record<string, any>[];
  options?: IDatabaseWithDeletedOptions;
};

export type IDatabaseFindOneLeftJoin = {
  id: number;
  field: string;
  options?: IDatabaseFindOneOptions;
};
