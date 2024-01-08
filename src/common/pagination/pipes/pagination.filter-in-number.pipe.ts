import { Inject, Injectable, mixin, Type } from "@nestjs/common";
import { PipeTransform, Scope } from "@nestjs/common/interfaces";
import { REQUEST } from "@nestjs/core";
import { HelperArrayService } from "src/common/helper/services/helper.array.service";
import { PaginationService } from "src/common/pagination/services/pagination.service";
import { IRequestApp } from "src/common/request/interfaces/request.interface";
import { FindOperator } from "typeorm";

export function PaginationFilterInNumberPipe(
  field: string,
  defaultValue?: number[],
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinPaginationFilterInBooleanPipe implements PipeTransform {
    constructor(
      @Inject(REQUEST) protected readonly request: IRequestApp,
      private readonly paginationService: PaginationService,
      private readonly helperArrayService: HelperArrayService,
    ) {}

    async transform(value: string): Promise<Record<string, FindOperator<number[]>>> {
      let finalValue: number[] = defaultValue as number[];

      if (!value) {
        return undefined;
      }

      if (value) {
        finalValue = this.helperArrayService.unique<number>(
          value.split(",").map((val: string) => parseInt(val, 10)),
        );
      }

      return this.paginationService.filterIn<number>(field, finalValue);
    }
  }

  return mixin(MixinPaginationFilterInBooleanPipe);
}
