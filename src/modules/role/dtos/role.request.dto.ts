import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export class RoleRequestDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  role: number;
}
