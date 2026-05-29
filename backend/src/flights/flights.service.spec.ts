import { describe, it, expect, vi } from 'vitest';
import { FlightsService } from './flights.service';
import type { DrizzleDB } from '../db/drizzle.provider';

function dbReturning(rows: unknown[]) {
  const orderBy = vi.fn().mockResolvedValue(rows);
  const where = vi.fn().mockReturnValue({ orderBy });
  const from = vi.fn().mockReturnValue({ where });
  const select = vi.fn().mockReturnValue({ from });
  return { db: { select }, where, orderBy };
}

const rows = [
  {
    id: 1,
    origin: 'New York (JFK)',
    destination: 'London (LHR)',
    departureTime: new Date('2026-07-15T08:30:00Z'),
    durationMinutes: 420,
    price: '450.00',
    availableSeats: 45,
    cabin: 'economy',
  },
];

describe('FlightsService.searchFlights', () => {
  it('maps rows to DTOs with a numeric price', async () => {
    const { db } = dbReturning(rows);
    const service = new FlightsService(db as unknown as DrizzleDB);

    const result = await service.searchFlights({});

    expect(result).toHaveLength(1);
    expect(result[0].price).toBe(450);
    expect(typeof result[0].price).toBe('number');
  });

  it('applies no WHERE clause when there are no filters', async () => {
    const { db, where } = dbReturning(rows);
    const service = new FlightsService(db as unknown as DrizzleDB);

    await service.searchFlights({});

    expect(where).toHaveBeenCalledWith(undefined);
  });

  it('builds a WHERE clause when filters are provided', async () => {
    const { db, where } = dbReturning(rows);
    const service = new FlightsService(db as unknown as DrizzleDB);

    await service.searchFlights({ origin: 'New York', cabin: 'economy' });

    expect(where).toHaveBeenCalledTimes(1);
    expect(where.mock.calls[0][0]).toBeDefined();
  });
});
