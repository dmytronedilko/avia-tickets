import { describe, it, expect, vi } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import type { DrizzleDB } from '../db/drizzle.provider';
import type { JwtService } from '@nestjs/jwt';

function makeJwt() {
  return {
    sign: vi.fn().mockReturnValue('signed.jwt.token'),
  };
}

describe('AuthService.register', () => {
  it('hashes the password, normalizes email and returns a token', async () => {
    const valuesReturning = vi.fn().mockResolvedValue([
      {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'stored-hash',
        balance: '1000.00',
        createdAt: new Date(),
      },
    ]);
    const valuesSpy = vi.fn().mockReturnValue({ returning: valuesReturning });
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      }),
      insert: vi.fn().mockReturnValue({ values: valuesSpy }),
    };
    const jwt = makeJwt();
    const service = new AuthService(
      db as unknown as DrizzleDB,
      jwt as unknown as JwtService,
    );

    const result = await service.register({
      email: '  TEST@example.com ',
      name: ' Test User ',
      password: 'secret123',
    });

    expect(result.token).toBe('signed.jwt.token');
    expect(result.user).toEqual({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      balance: 1000,
    });

    const inserted = valuesSpy.mock.calls[0][0];
    expect(inserted.email).toBe('test@example.com');
    expect(inserted.name).toBe('Test User');
    expect(inserted.passwordHash).not.toBe('secret123');
    expect(bcrypt.compareSync('secret123', inserted.passwordHash)).toBe(true);
    expect(jwt.sign).toHaveBeenCalledWith({
      sub: 1,
      email: 'test@example.com',
    });
  });

  it('throws ConflictException when the email already exists', async () => {
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ id: 1 }]),
        }),
      }),
      insert: vi.fn(),
    };
    const service = new AuthService(
      db as unknown as DrizzleDB,
      makeJwt() as unknown as JwtService,
    );

    await expect(
      service.register({
        email: 'taken@example.com',
        name: 'Someone',
        password: 'secret123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(db.insert).not.toHaveBeenCalled();
  });
});

describe('AuthService.login', () => {
  function dbWithUser(rows: unknown[]) {
    return {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(rows),
        }),
      }),
    };
  }

  it('returns a token for valid credentials', async () => {
    const passwordHash = bcrypt.hashSync('secret123', 10);
    const db = dbWithUser([
      {
        id: 5,
        email: 'user@example.com',
        name: 'User',
        passwordHash,
        balance: '250.00',
        createdAt: new Date(),
      },
    ]);
    const service = new AuthService(
      db as unknown as DrizzleDB,
      makeJwt() as unknown as JwtService,
    );

    const result = await service.login({
      email: 'USER@example.com',
      password: 'secret123',
    });

    expect(result.token).toBe('signed.jwt.token');
    expect(result.user.id).toBe(5);
    expect(result.user.balance).toBe(250);
  });

  it('rejects an unknown email', async () => {
    const service = new AuthService(
      dbWithUser([]) as unknown as DrizzleDB,
      makeJwt() as unknown as JwtService,
    );

    await expect(
      service.login({ email: 'nobody@example.com', password: 'secret123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a wrong password', async () => {
    const passwordHash = bcrypt.hashSync('secret123', 10);
    const db = dbWithUser([
      {
        id: 5,
        email: 'user@example.com',
        name: 'User',
        passwordHash,
        balance: '0',
        createdAt: new Date(),
      },
    ]);
    const service = new AuthService(
      db as unknown as DrizzleDB,
      makeJwt() as unknown as JwtService,
    );

    await expect(
      service.login({ email: 'user@example.com', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
