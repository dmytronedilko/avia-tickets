import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export type FlightSort = 'best' | 'cheapest' | 'fastest' | 'earliest';
export type Cabin = 'economy' | 'premium' | 'business' | 'first';

export const CABINS: Cabin[] = ['economy', 'premium', 'business', 'first'];

export class SearchFlightsDto {
  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsIn(['best', 'cheapest', 'fastest', 'earliest'])
  sort?: FlightSort;

  @IsOptional()
  @IsIn(CABINS)
  cabin?: Cabin;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9)
  passengers?: number;
}
