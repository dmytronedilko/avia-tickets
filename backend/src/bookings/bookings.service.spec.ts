import { describe, it, expect, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import type { DrizzleDB } from '../db/drizzle.provider';

function makeTx() {
  const selectWhere = vi.fn();
  const updateReturning = vi.fn();
  const insertReturning = vi.fn();
  const tx = {
    select: vi.fn(() => ({
      from: vi.fn(() => ({ where: selectWhere })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({ returning: updateReturning })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({ returning: insertReturning })),
    })),
  };
  return { tx, selectWhere, updateReturning, insertReturning };
}

function makeService(tx: unknown) {
  const db = {
    transaction: vi.fn(async (cb: (tx: unknown) => unknown) => cb(tx)),
  };
  return {
    service: new BookingsService(db as unknown as DrizzleDB),
    transaction: db.transaction,
  };
}

const user = {
  id: 1,
  name: 'Jane',
  email: 'jane@example.com',
  passwordHash: 'x',
  balance: '1000.00',
  createdAt: new Date(),
};

function flight(id: number, price: string, seats = 50) {
  return {
    id,
    origin: 'X',
    destination: 'Y',
    departureTime: new Date('2026-07-15T08:30:00Z'),
    durationMinutes: 100,
    price,
    availableSeats: seats,
    cabin: 'economy',
  };
}

describe('BookingsService.createBooking', () => {
  it('rejects when the return flight equals the outbound flight', async () => {
    const { tx } = makeTx();
    const { service, transaction } = makeService(tx);

    await expect(
      service.createBooking(1, { flightId: 3, returnFlightId: 3 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(transaction).not.toHaveBeenCalled();
  });

  it('throws NotFound when the user does not exist', async () => {
    const { tx, selectWhere } = makeTx();
    selectWhere.mockResolvedValueOnce([]);
    const { service } = makeService(tx);

    await expect(
      service.createBooking(1, { flightId: 10 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFound when the outbound flight is missing', async () => {
    const { tx, selectWhere } = makeTx();
    selectWhere.mockResolvedValueOnce([user]).mockResolvedValueOnce([]);
    const { service } = makeService(tx);

    await expect(
      service.createBooking(1, { flightId: 10 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects when the balance is insufficient', async () => {
    const { tx, selectWhere } = makeTx();
    const poorUser = { ...user, balance: '10.00' };
    selectWhere
      .mockResolvedValueOnce([poorUser])
      .mockResolvedValueOnce([flight(10, '450.00')]);
    const { service } = makeService(tx);

    await expect(
      service.createBooking(1, { flightId: 10 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when there are not enough seats', async () => {
    const { tx, selectWhere, updateReturning } = makeTx();
    selectWhere
      .mockResolvedValueOnce([user])
      .mockResolvedValueOnce([flight(10, '100.00')]);
    updateReturning.mockResolvedValueOnce([]);
    const { service } = makeService(tx);

    await expect(
      service.createBooking(1, { flightId: 10 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('books a one-way flight and charges fare plus 12% tax', async () => {
    const { tx, selectWhere, updateReturning, insertReturning } = makeTx();
    // fareSum = 100, passengers = 2 -> total = 100 * 2 * 1.12 = 224
    selectWhere
      .mockResolvedValueOnce([user])
      .mockResolvedValueOnce([flight(10, '100.00')]);
    updateReturning
      .mockResolvedValueOnce([flight(10, '100.00', 48)])
      .mockResolvedValueOnce([{ ...user, balance: '776.00' }]);
    insertReturning.mockResolvedValueOnce([
      {
        id: 99,
        userId: 1,
        flightId: 10,
        returnFlightId: null,
        passengers: 2,
        bookingTime: new Date(),
        status: 'confirmed',
        pricePaid: '224.00',
      },
    ]);
    const { service } = makeService(tx);

    const result = await service.createBooking(1, {
      flightId: 10,
      passengers: 2,
    });

    expect(result.pricePaid).toBe(224);
    expect(result.balance).toBe(776);
    expect(result.returnFlight).toBeNull();
    expect(result.flight.price).toBe(100);
    expect(result.passenger).toEqual({
      name: 'Jane',
      email: 'jane@example.com',
    });
  });

  it('books a round trip and sums both fares', async () => {
    const { tx, selectWhere, updateReturning, insertReturning } = makeTx();
    // fareSum = 100 + 150 = 250, passengers = 1 -> total = 250 * 1.12 = 280
    selectWhere
      .mockResolvedValueOnce([user])
      .mockResolvedValueOnce([flight(10, '100.00'), flight(20, '150.00')]);
    updateReturning
      .mockResolvedValueOnce([flight(10, '100.00', 49)])
      .mockResolvedValueOnce([flight(20, '150.00', 49)])
      .mockResolvedValueOnce([{ ...user, balance: '720.00' }]);
    insertReturning.mockResolvedValueOnce([
      {
        id: 100,
        userId: 1,
        flightId: 10,
        returnFlightId: 20,
        passengers: 1,
        bookingTime: new Date(),
        status: 'confirmed',
        pricePaid: '280.00',
      },
    ]);
    const { service } = makeService(tx);

    const result = await service.createBooking(1, {
      flightId: 10,
      returnFlightId: 20,
    });

    expect(result.pricePaid).toBe(280);
    expect(result.balance).toBe(720);
    expect(result.returnFlight).not.toBeNull();
    expect(result.returnFlight?.price).toBe(150);
  });
});
