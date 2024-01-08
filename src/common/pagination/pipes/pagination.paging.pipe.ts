import { Inject, Injectable, mixin, Type } from "@nestjs/common";
import { PipeTransform, Scope } from "@nestjs/common/interfaces";
import { REQUEST } from "@nestjs/core";
import { HelperNumberService } from "src/common/helper/services/helper.number.service";
import { PaginationService } from "src/common/pagination/services/pagination.service";
import { IRequestApp } from "src/common/request/interfaces/request.interface";

export function PaginationPagingPipe(defaultPerPage: number, maxPage = false): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinPaginationPagingPipe implements PipeTransform {
    constructor(
      @Inject(REQUEST) protected readonly request: IRequestApp,
      private readonly paginationService: PaginationService,
      private readonly helperNumberService: HelperNumberService,
    ) {}

    async transform(value: Record<string, any>): Promise<Record<string, any>> {
      const page: number = this.paginationService.page(
        this.helperNumberService.create(value?.page ?? 1),
        maxPage,
      );
      const perPage: number = this.paginationService.perPage(
        this.helperNumberService.create(value?.perPage ?? defaultPerPage),
      );

      const skip: number = this.paginationService.skip(page, perPage, maxPage);

      this.request.__pagination = {
        ...this.request.__pagination,
        page,
        perPage,
      };

      return {
        ...value,
        page,
        perPage,
        _take: perPage,
        _skip: skip,
      };
    }
  }

  return mixin(MixinPaginationPagingPipe);
}
