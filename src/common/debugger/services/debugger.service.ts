import { Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { IDebuggerLog } from "../interfaces/debugger.interface";
import { IDebuggerService } from "../interfaces/debugger.service.interface";
import { Logger } from "winston";

@Injectable()
export class DebuggerService implements IDebuggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  info(requestId: string, log: IDebuggerLog, data?: any): void {
    this.logger.info(log.description, {
      id: requestId,
      class: log.class,
      function: log.function,
      path: log.path,
      data,
    });
  }

  debug(requestId: string, log: IDebuggerLog, data?: any): void {
    this.logger.debug(log.description, {
      id: requestId,
      class: log.class,
      function: log.function,
      path: log.path,
      data,
    });
  }

  warn(requestId: string, log: IDebuggerLog, data?: any): void {
    this.logger.warn(log.description, {
      id: requestId,
      class: log.class,
      function: log.function,
      path: log.path,
      data,
    });
  }

  error(requestId: string, log: IDebuggerLog, data?: any): void {
    this.logger.error(log.description, {
      id: requestId,
      class: log.class,
      function: log.function,
      path: log.path,
      data,
    });
  }
}
