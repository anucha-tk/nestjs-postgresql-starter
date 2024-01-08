import { Inject, Injectable, mixin, Type } from "@nestjs/common";
import { PipeTransform, Scope } from "@nestjs/common/interfaces";
import { REQUEST } from "@nestjs/core";
import { HelperArrayService } from "src/common/helper/services/helper.array.service";
import { IRequestApp } from "src/common/request/interfaces/request.interface";

export function PaginationRelationsPipe(defaultValue: string[]): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinPaginationFilterInBooleanPipe implements PipeTransform {
    constructor(
      @Inject(REQUEST) protected readonly request: IRequestApp,
      private readonly helperArrayService: HelperArrayService,
    ) {}

    async transform(value: string): Promise<Record<string, boolean>> {
      let finalValue: string[] = defaultValue;

      if (value) {
        finalValue = this.helperArrayService.unique(value.split(",").map((val: string) => val));
      }

      const relations: Record<string, boolean> = {};
      finalValue.forEach((e) => {
        relations[e] = true;
      });

      return relations;
    }
  }

  return mixin(MixinPaginationFilterInBooleanPipe);
}
