import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../db/drizzle.provider';
import * as schema from '../db/schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './jwt.strategy';
import { PublicUser, toPublicUser } from '../users/user.mapper';

const STARTER_BALANCE = '1000.00';
const BCRYPT_ROUNDS = 10;

export interface AuthResult {
  token: string;
  user: PublicUser;
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const email = normalizeEmail(dto.email);

    const [existing] = await this.db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, email));

    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const [user] = await this.db
      .insert(schema.users)
      .values({
        email,
        name: dto.name.trim(),
        passwordHash,
        balance: STARTER_BALANCE,
      })
      .returning();

    return this.buildResult(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const email = normalizeEmail(dto.email);

    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildResult(user);
  }

  private buildResult(user: typeof schema.users.$inferSelect): AuthResult {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return {
      token: this.jwt.sign(payload),
      user: toPublicUser(user),
    };
  }
}
