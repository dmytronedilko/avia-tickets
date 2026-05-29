import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, gte, sql, desc, inArray } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../db/drizzle.provider';
import * as schema from '../db/schema';
import { toFlightDto } from '../flights/flight.mapper';

const TAX_RATE = 0.12;

function computeTotal(fareSum: number, passengers: number): number {
  return Number((fareSum * passengers * (1 + TAX_RATE)).toFixed(2));
}

interface CreateBookingArgs {
  flightId: number;
  returnFlightId?: number;
  passengers?: number;
}

@Injectable()
export class BookingsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async createBooking(userId: number, args: CreateBookingArgs) {
    const passengers = args.passengers ?? 1;
    if (args.returnFlightId && args.returnFlightId === args.flightId) {
      throw new BadRequestException(
        'Return flight must differ from the outbound flight.',
      );
    }

    return this.db.transaction(async (tx) => {
      const [user] = await tx
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, userId));

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const flightIds = args.returnFlightId
        ? [args.flightId, args.returnFlightId]
        : [args.flightId];

      const fetched = await tx
        .select()
        .from(schema.flights)
        .where(inArray(schema.flights.id, flightIds));

      const outbound = fetched.find((f) => f.id === args.flightId);
      if (!outbound) {
        throw new NotFoundException('Flight not found');
      }
      const returnFlight = args.returnFlightId
        ? fetched.find((f) => f.id === args.returnFlightId)
        : undefined;
      if (args.returnFlightId && !returnFlight) {
        throw new NotFoundException('Return flight not found');
      }

      const fareSum =
        Number(outbound.price) +
        (returnFlight ? Number(returnFlight.price) : 0);
      const total = computeTotal(fareSum, passengers);
      const totalStr = total.toFixed(2);
      const balance = Number(user.balance);

      if (balance < total) {
        throw new BadRequestException(
          `Insufficient balance. Need $${totalStr}, have $${balance.toFixed(2)}.`,
        );
      }

      const reserveSeats = async (flightId: number) => {
        const [updated] = await tx
          .update(schema.flights)
          .set({
            availableSeats: sql`${schema.flights.availableSeats} - ${passengers}`,
          })
          .where(
            and(
              eq(schema.flights.id, flightId),
              gte(schema.flights.availableSeats, passengers),
            ),
          )
          .returning();

        if (!updated) {
          throw new BadRequestException(
            passengers === 1
              ? 'No available seats on this flight'
              : `Not enough seats for ${passengers} passengers`,
          );
        }
        return updated;
      };

      const updatedOutbound = await reserveSeats(args.flightId);
      const updatedReturn = args.returnFlightId
        ? await reserveSeats(args.returnFlightId)
        : undefined;

      const [updatedUser] = await tx
        .update(schema.users)
        .set({
          balance: sql`${schema.users.balance} - ${totalStr}`,
        })
        .where(eq(schema.users.id, userId))
        .returning();

      const [booking] = await tx
        .insert(schema.bookings)
        .values({
          userId,
          flightId: args.flightId,
          returnFlightId: args.returnFlightId ?? null,
          passengers,
          status: 'confirmed',
          pricePaid: totalStr,
        })
        .returning();

      return {
        ...booking,
        pricePaid: Number(booking.pricePaid),
        flight: toFlightDto(updatedOutbound),
        returnFlight: updatedReturn ? toFlightDto(updatedReturn) : null,
        passenger: {
          name: updatedUser.name,
          email: updatedUser.email,
        },
        balance: Number(updatedUser.balance),
      };
    });
  }

  async cancelBooking(userId: number, bookingId: number) {
    return this.db.transaction(async (tx) => {
      const [booking] = await tx
        .select()
        .from(schema.bookings)
        .where(
          and(
            eq(schema.bookings.id, bookingId),
            eq(schema.bookings.userId, userId),
          ),
        );

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }
      if (booking.status === 'cancelled') {
        throw new BadRequestException('Booking is already cancelled');
      }

      const restoreSeats = async (flightId: number) => {
        await tx
          .update(schema.flights)
          .set({
            availableSeats: sql`${schema.flights.availableSeats} + ${booking.passengers}`,
          })
          .where(eq(schema.flights.id, flightId));
      };

      await restoreSeats(booking.flightId);
      if (booking.returnFlightId) {
        await restoreSeats(booking.returnFlightId);
      }

      const refundStr = Number(booking.pricePaid).toFixed(2);
      const [updatedUser] = await tx
        .update(schema.users)
        .set({
          balance: sql`${schema.users.balance} + ${refundStr}`,
        })
        .where(eq(schema.users.id, userId))
        .returning();

      const [updatedBooking] = await tx
        .update(schema.bookings)
        .set({ status: 'cancelled' })
        .where(eq(schema.bookings.id, bookingId))
        .returning();

      return {
        id: updatedBooking.id,
        status: updatedBooking.status,
        refund: Number(booking.pricePaid),
        balance: Number(updatedUser.balance),
      };
    });
  }

  async listForUser(userId: number) {
    const rows = await this.db.query.bookings.findMany({
      where: eq(schema.bookings.userId, userId),
      orderBy: desc(schema.bookings.bookingTime),
      with: {
        flight: true,
      },
    });

    const returnIds = rows
      .map((b) => b.returnFlightId)
      .filter((id): id is number => id !== null);

    const returnFlights = returnIds.length
      ? await this.db
          .select()
          .from(schema.flights)
          .where(inArray(schema.flights.id, returnIds))
      : [];
    const returnMap = new Map(returnFlights.map((f) => [f.id, f]));

    return rows.map((booking) => {
      const ret = booking.returnFlightId
        ? returnMap.get(booking.returnFlightId)
        : null;
      return {
        id: booking.id,
        flightId: booking.flightId,
        returnFlightId: booking.returnFlightId,
        passengers: booking.passengers,
        bookingTime: booking.bookingTime,
        status: booking.status,
        pricePaid: Number(booking.pricePaid),
        flight: toFlightDto(booking.flight),
        returnFlight: ret ? toFlightDto(ret) : null,
      };
    });
  }
}
