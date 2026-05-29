import * as schema from '../db/schema';

export interface PublicUser {
  id: number;
  email: string;
  name: string;
  balance: number;
}

type UserRow = Pick<
  typeof schema.users.$inferSelect,
  'id' | 'email' | 'name' | 'balance'
>;

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    balance: Number(row.balance),
  };
}
