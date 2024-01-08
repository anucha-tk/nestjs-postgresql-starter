import { LoggerCreateDto, LoggerCreateRawDto } from "src/common/logger/dtos/logger.create.dto";
import { LoggerEntity } from "../repository/entities/logger.entity";

export interface ILoggerService {
  info({
    action,
    description,
    apiKey,
    user,
    method,
    requestId,
    type,
    params,
    bodies,
    path,
    statusCode,
    tags,
  }: LoggerCreateDto): Promise<LoggerEntity>;
  debug({
    action,
    description,
    apiKey,
    user,
    method,
    requestId,
    type,
    params,
    bodies,
    path,
    statusCode,
    tags,
  }: LoggerCreateDto): Promise<LoggerEntity>;
  warn({
    action,
    description,
    apiKey,
    user,
    method,
    requestId,
    type,
    params,
    bodies,
    path,
    statusCode,
    tags,
  }: LoggerCreateDto): Promise<LoggerEntity>;
  fatal({
    action,
    description,
    apiKey,
    user,
    method,
    requestId,
    type,
    params,
    bodies,
    path,
    statusCode,
    tags,
  }: LoggerCreateDto): Promise<LoggerEntity>;
  raw({
    level,
    action,
    description,
    apiKey,
    user,
    method,
    requestId,
    type,
    params,
    bodies,
    path,
    statusCode,
    tags,
  }: LoggerCreateRawDto): Promise<LoggerEntity>;
}
