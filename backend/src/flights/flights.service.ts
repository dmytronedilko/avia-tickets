import { Injectable, Inject } from '@nestjs/common';
import { and, asc, desc, eq, gte, lt, ilike, SQL } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../db/drizzle.provider';
import * as schema from '../db/schema';
import { SearchFlightsDto, FlightSort } from './dto/search-flights.dto';
import { toFlightDto } from './flight.mapper';

function buildSortClauses(sort: FlightSort | undefined) {
  switch (sort) {
    case 'cheapest':
      return [asc(schema.flights.price), asc(schema.flights.departureTime)];
    case 'fastest':
      return [asc(schema.flights.durationMinutes), asc(schema.flights.price)];
    case 'earliest':
      return [asc(schema.flights.departureTime), asc(schema.flights.price)];
    case 'best':
    default:
      return [
        asc(schema.flights.price),
        asc(schema.flights.durationMinutes),
        desc(schema.flights.availableSeats),
        asc(schema.flights.departureTime),
      ];
  }
}

function buildSearchConditions(query: SearchFlightsDto): SQL[] {
  const conditions: SQL[] = [];

  if (query.origin) {
    conditions.push(ilike(schema.flights.origin, `%${query.origin}%`));
  }
  if (query.destination) {
    conditions.push(
      ilike(schema.flights.destination, `%${query.destination}%`),
    );
  }
  if (query.date) {
    const startOfDay = new Date(query.date);
    const endOfDay = new Date(query.date);
    endOfDay.setDate(endOfDay.getDate() + 1);
    conditions.push(gte(schema.flights.departureTime, startOfDay));
    conditions.push(lt(schema.flights.departureTime, endOfDay));
  }
  if (query.cabin) {
    conditions.push(eq(schema.flights.cabin, query.cabin));
  }
  if (query.passengers && query.passengers > 1) {
    conditions.push(gte(schema.flights.availableSeats, query.passengers));
  }

  return conditions;
}

@Injectable()
export class FlightsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async searchFlights(query: SearchFlightsDto) {
    const conditions = buildSearchConditions(query);
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const orderBy = buildSortClauses(query.sort);

    const flights = await this.db
      .select()
      .from(schema.flights)
      .where(whereClause)
      .orderBy(...orderBy);

    return flights.map(toFlightDto);
  }
}
