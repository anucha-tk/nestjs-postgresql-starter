import { Inject, Injectable, mixin, Type } from "@nestjs/common";
import { PipeTransform, Scope } from "@nestjs/common/interfaces";
import { REQUEST } from "@nestjs/core";
import { PaginationService } from "src/common/pagination/services/pagination.service";
import { IRequestApp } from "src/common/request/interfaces/request.interface";
import { FindOperator } from "typeorm";

export function PaginationFilterInEnumPipe<T>(
  field: string,
  defaultValue: T,
  defaultEnum: Record<string, any>,
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinPaginationFilterInEnumPipe implements PipeTransform {
    constructor(
      @Inject(REQUEST) protected readonly request: IRequestApp,
      private readonly paginationService: PaginationService,
    ) {}

    async transform(value: string): Promise<Record<string, FindOperator<T[]>>> {
      let finalValue: T[] = defaultValue as T[];

      if (value) {
        finalValue = value
          .split(",")
          .map((val: string) => defaultEnum[val])
          .filter((val: string) => val) as T[];
      }

      return this.paginationService.filterIn<T>(field, finalValue);
    }
  }

  return mixin(MixinPaginationFilterInEnumPipe);
}
