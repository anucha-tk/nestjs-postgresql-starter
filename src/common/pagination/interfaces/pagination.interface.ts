import {
  ENUM_PAGINATION_FILTER_CASE_OPTIONS,
  ENUM_PAGINATION_FILTER_DATE_TIME_OPTIONS,
} from "src/common/pagination/constants/pagination.enum.constant";
import { FindOptionsOrder } from "typeorm";

// export type IPaginationOrder = Record<string, ENUM_PAGINATION_ORDER_DIRECTION_TYPE>;
export type IPaginationOrder = FindOptionsOrder<any>;

export interface IPaginationPaging {
  skip?: number;
  take?: number;
}

/**
 * pagination Options
 */
export interface IPaginationOptions<> {
  paging?: IPaginationPaging;
  order?: IPaginationOrder;
}

export interface IPaginationFilterDateOptions {
  time?: ENUM_PAGINATION_FILTER_DATE_TIME_OPTIONS;
}

export interface IPaginationFilterStringContainOptions {
  case?: ENUM_PAGINATION_FILTER_CASE_OPTIONS;
  trim?: boolean;
  fullMatch?: boolean;
}

export interface IPaginationFilterStringEqualOptions extends IPaginationFilterStringContainOptions {
  isNumber?: boolean;
}
