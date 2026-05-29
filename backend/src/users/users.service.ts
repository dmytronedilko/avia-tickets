import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../db/drizzle.provider';
import * as schema from '../db/schema';
import { PublicUser, toPublicUser } from './user.mapper';

export { PublicUser } from './user.mapper';

const PUBLIC_USER_COLUMNS = {
  id: schema.users.id,
  email: schema.users.email,
  name: schema.users.name,
  balance: schema.users.balance,
} as const;

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async getById(id: number): Promise<PublicUser> {
    const [user] = await this.db
      .select(PUBLIC_USER_COLUMNS)
      .from(schema.users)
      .where(eq(schema.users.id, id));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return toPublicUser(user);
  }

  async topUp(id: number, amount: number): Promise<PublicUser> {
    const [updated] = await this.db
      .update(schema.users)
      .set({
        balance: sql`${schema.users.balance} + ${amount.toFixed(2)}`,
      })
      .where(eq(schema.users.id, id))
      .returning(PUBLIC_USER_COLUMNS);

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return toPublicUser(updated);
  }
}
