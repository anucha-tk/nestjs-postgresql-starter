import { Type } from "class-transformer";
import { IsNotEmpty } from "class-validator";

export class ApiKeyRequestDto {
  @IsNotEmpty()
  @Type(() => Number)
  apiKey: number;
}
