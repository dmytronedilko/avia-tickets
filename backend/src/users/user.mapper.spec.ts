import { describe, it, expect } from 'vitest';
import { toPublicUser } from './user.mapper';

describe('toPublicUser', () => {
  it('maps a user row and coerces balance to a number', () => {
    const result = toPublicUser({
      id: 7,
      email: 'user@example.com',
      name: 'Jane Doe',
      balance: '1000.00',
    });

    expect(result).toEqual({
      id: 7,
      email: 'user@example.com',
      name: 'Jane Doe',
      balance: 1000,
    });
    expect(typeof result.balance).toBe('number');
  });

  it('does not leak the password hash', () => {
    const result = toPublicUser({
      id: 1,
      email: 'a@b.com',
      name: 'A',
      balance: '0',
    });
    expect(result).not.toHaveProperty('passwordHash');
  });
});
