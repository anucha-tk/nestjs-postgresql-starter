import { Inject, Injectable, mixin, Type } from "@nestjs/common";
import { PipeTransform, Scope } from "@nestjs/common/interfaces";
import { REQUEST } from "@nestjs/core";
import { HelperArrayService } from "src/common/helper/services/helper.array.service";
import { PaginationService } from "src/common/pagination/services/pagination.service";
import { IRequestApp } from "src/common/request/interfaces/request.interface";
import { FindOperator } from "typeorm";

export function PaginationFilterInBooleanPipe(
  field: string,
  defaultValue: boolean[],
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinPaginationFilterInBooleanPipe implements PipeTransform {
    constructor(
      @Inject(REQUEST) protected readonly request: IRequestApp,
      private readonly paginationService: PaginationService,
      private readonly helperArrayService: HelperArrayService,
    ) {}

    async transform(value: string): Promise<Record<string, FindOperator<boolean | boolean[]>>> {
      let finalValue: boolean[] = defaultValue as boolean[];

      if (value) {
        finalValue = this.helperArrayService.unique(
          value.split(",").map((val: string) => val === "true"),
        );
      }

      return this.paginationService.filterIn<boolean>(field, finalValue);
    }
  }

  return mixin(MixinPaginationFilterInBooleanPipe);
}
