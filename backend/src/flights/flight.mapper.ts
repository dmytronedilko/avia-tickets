import * as schema from '../db/schema';

type FlightRow = typeof schema.flights.$inferSelect;

export interface FlightDto extends Omit<FlightRow, 'price'> {
  price: number;
}

export function toFlightDto(row: FlightRow): FlightDto {
  return { ...row, price: Number(row.price) };
}
