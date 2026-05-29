import { describe, it, expect } from 'vitest';
import { toFlightDto } from './flight.mapper';

describe('toFlightDto', () => {
  const row = {
    id: 1,
    origin: 'New York (JFK)',
    destination: 'London (LHR)',
    departureTime: new Date('2026-07-15T08:30:00Z'),
    durationMinutes: 420,
    price: '450.00',
    availableSeats: 45,
    cabin: 'economy',
  };

  it('converts the numeric price string to a number', () => {
    const dto = toFlightDto(row);
    expect(dto.price).toBe(450);
    expect(typeof dto.price).toBe('number');
  });

  it('preserves every other column unchanged', () => {
    const dto = toFlightDto(row);
    expect(dto).toMatchObject({
      id: 1,
      origin: 'New York (JFK)',
      destination: 'London (LHR)',
      durationMinutes: 420,
      availableSeats: 45,
      cabin: 'economy',
    });
    expect(dto.departureTime).toBe(row.departureTime);
  });
});
