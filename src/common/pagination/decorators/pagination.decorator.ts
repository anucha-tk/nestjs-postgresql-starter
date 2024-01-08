import { Query } from "@nestjs/common";
import { ENUM_PAGINATION_ORDER_DIRECTION_TYPE } from "../constants/pagination.enum.constant";
import { IPaginationFilterStringContainOptions } from "../interfaces/pagination.interface";
import { PaginationFilterContainPipe } from "../pipes/pagination.filter-contain.pipe";
import { PaginationFilterInBooleanPipe } from "../pipes/pagination.filter-in-boolean.pipe";
import { PaginationFilterInEnumPipe } from "../pipes/pagination.filter-in-enum.pipe";
import { PaginationJoinPipe } from "../pipes/pagination.join.pipe";
import { PaginationOrderPipe } from "../pipes/pagination.order.pipe";
import { PaginationPagingPipe } from "../pipes/pagination.paging.pipe";
import { PaginationMultiQueryOperatorsPipe } from "../pipes/pagination.query-operator.pipe";
import { PaginationSearchPipe } from "../pipes/pagination.search.pipe";
import { PaginationFilterInNumberPipe } from "../pipes/pagination.filter-in-number.pipe";
import { PaginationRelationsPipe } from "../pipes/pagination.relations.pipe";

export function PaginationQuery(
  defaultPerPage: number,
  defaultOrderBy: string,
  defaultOrderDirection: ENUM_PAGINATION_ORDER_DIRECTION_TYPE,
  availableSearch: string[],
  availableOrderBy: string[],
  maxPage = false,
): ParameterDecorator {
  return Query(
    PaginationSearchPipe(availableSearch),
    PaginationPagingPipe(defaultPerPage, maxPage),
    PaginationOrderPipe(defaultOrderBy, defaultOrderDirection, availableOrderBy),
  );
}

export function PaginationQueryFilterInBoolean(
  field: string,
  defaultValue: boolean[],
  queryField?: string,
): ParameterDecorator {
  return Query(queryField ?? field, PaginationFilterInBooleanPipe(field, defaultValue));
}

export function PaginationQueryFilterInEnum<T>(
  field: string,
  defaultValue: T,
  defaultEnum: Record<string, any>,
  queryField?: string,
): ParameterDecorator {
  return Query(
    queryField ?? field,
    PaginationFilterInEnumPipe<T>(field, defaultValue, defaultEnum),
  );
}

/**
 * Pagination query boolean
 *
 * @param queryField name string of single property to extract from the `query` object
 * @param defaultValue boolean
 *
 * @example
 *    `@PaginationQueryBoolean({ defaultValue: false })`
 *    join: boolean,
 *
 *    `@PaginationQueryBoolean({ defaultValue: false })`
 *    withDeleted: boolean,
 */
export function PaginationQueryBoolean({
  queryField,
  defaultValue,
}: {
  queryField: string;
  defaultValue: boolean;
}): ParameterDecorator {
  return Query(queryField, PaginationJoinPipe(defaultValue));
}

export function PaginationQueryFilterContain(
  field: string,
  queryField?: string,
  options?: IPaginationFilterStringContainOptions,
  raw = false,
): ParameterDecorator {
  return Query(queryField ?? field, PaginationFilterContainPipe(field, raw, options));
}

/**
 * Pagination query operator
 * @param queryOperators string like Record<string,any>[]
 *
 * @example
 * # Query
 *    queryOperators=[{"field":"tdp","operator":">","value":"200"}, {"field":"tdp","operator":"<","value":"210"}]
 *
 * # how to use
 *    `@PaginationMultiQueryOperators()`
 *    multiQueryOperators: Record<string,any>
 *
 * */
export function PaginationMultiQueryOperators(): ParameterDecorator {
  return Query("multiQueryOperators", PaginationMultiQueryOperatorsPipe());
}

export function PaginationQueryFilterInNumber({
  field,
  defaultValue,
  queryField,
}: {
  field: string;
  defaultValue?: number[];
  queryField?: string;
}): ParameterDecorator {
  return Query(queryField ?? field, PaginationFilterInNumberPipe(field, defaultValue));
}

export function PaginationQueryRelations(
  field: string,
  defaultValue: string[],
): ParameterDecorator {
  return Query(field, PaginationRelationsPipe(defaultValue));
}
