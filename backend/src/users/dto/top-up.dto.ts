import { IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class TopUpDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(10000)
  amount!: number;
}
