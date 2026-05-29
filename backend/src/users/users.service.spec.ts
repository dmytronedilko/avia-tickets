import { describe, it, expect, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import type { DrizzleDB } from '../db/drizzle.provider';

function selectReturning(rows: unknown[]) {
  return {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(rows),
      }),
    }),
  };
}

function updateReturning(rows: unknown[]) {
  const returning = vi.fn().mockResolvedValue(rows);
  return {
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({ returning }),
      }),
    }),
  };
}

describe('UsersService.getById', () => {
  it('returns the public user when found', async () => {
    const db = selectReturning([
      { id: 1, email: 'a@b.com', name: 'A', balance: '500.00' },
    ]);
    const service = new UsersService(db as unknown as DrizzleDB);

    await expect(service.getById(1)).resolves.toEqual({
      id: 1,
      email: 'a@b.com',
      name: 'A',
      balance: 500,
    });
  });

  it('throws NotFoundException when the user is missing', async () => {
    const db = selectReturning([]);
    const service = new UsersService(db as unknown as DrizzleDB);

    await expect(service.getById(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('UsersService.topUp', () => {
  it('returns the updated public user', async () => {
    const db = updateReturning([
      { id: 1, email: 'a@b.com', name: 'A', balance: '1500.00' },
    ]);
    const service = new UsersService(db as unknown as DrizzleDB);

    await expect(service.topUp(1, 1000)).resolves.toEqual({
      id: 1,
      email: 'a@b.com',
      name: 'A',
      balance: 1500,
    });
  });

  it('throws NotFoundException when the user does not exist', async () => {
    const db = updateReturning([]);
    const service = new UsersService(db as unknown as DrizzleDB);

    await expect(service.topUp(42, 50)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
