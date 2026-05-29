import {
  pgTable,
  serial,
  varchar,
  timestamp,
  numeric,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  balance: numeric('balance', { precision: 12, scale: 2 })
    .notNull()
    .default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const flights = pgTable('flights', {
  id: serial('id').primaryKey(),
  origin: varchar('origin', { length: 255 }).notNull(),
  destination: varchar('destination', { length: 255 }).notNull(),
  departureTime: timestamp('departure_time').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  availableSeats: integer('available_seats').notNull().default(0),
  cabin: varchar('cabin', { length: 32 }).notNull().default('economy'),
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  flightId: integer('flight_id')
    .notNull()
    .references(() => flights.id),
  returnFlightId: integer('return_flight_id').references(() => flights.id),
  passengers: integer('passengers').notNull().default(1),
  bookingTime: timestamp('booking_time').defaultNow().notNull(),
  status: varchar('status', { length: 50 }).notNull().default('confirmed'),
  pricePaid: numeric('price_paid', { precision: 10, scale: 2 })
    .notNull()
    .default('0'),
});

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

export const flightsRelations = relations(flights, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  flight: one(flights, {
    fields: [bookings.flightId],
    references: [flights.id],
  }),
}));
