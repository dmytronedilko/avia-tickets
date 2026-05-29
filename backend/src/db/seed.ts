import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

async function seed(): Promise<void> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool, { schema });

  const existingFlights = await db.select().from(schema.flights).limit(1);
  if (existingFlights.length > 0) {
    console.log('Database already seeded, skipping...');
    await pool.end();
    return;
  }

  await db.insert(schema.users).values({
    email: 'guest@avia-tickets.com',
    name: 'Guest User',
  });

  await db.insert(schema.flights).values([
    // ── Outbound (economy)
    {
      origin: 'New York (JFK)',
      destination: 'London (LHR)',
      departureTime: new Date('2026-07-15T08:30:00Z'),
      durationMinutes: 420,
      price: '450.00',
      availableSeats: 45,
      cabin: 'economy',
    },
    {
      origin: 'Los Angeles (LAX)',
      destination: 'Tokyo (NRT)',
      departureTime: new Date('2026-07-20T11:00:00Z'),
      durationMinutes: 660,
      price: '780.00',
      availableSeats: 30,
      cabin: 'economy',
    },
    {
      origin: 'Chicago (ORD)',
      destination: 'Paris (CDG)',
      departureTime: new Date('2026-08-01T14:15:00Z'),
      durationMinutes: 510,
      price: '520.00',
      availableSeats: 60,
      cabin: 'economy',
    },
    {
      origin: 'Miami (MIA)',
      destination: 'Cancun (CUN)',
      departureTime: new Date('2026-08-10T07:45:00Z'),
      durationMinutes: 120,
      price: '250.00',
      availableSeats: 80,
      cabin: 'economy',
    },
    {
      origin: 'San Francisco (SFO)',
      destination: 'Sydney (SYD)',
      departureTime: new Date('2026-08-25T22:00:00Z'),
      durationMinutes: 840,
      price: '1200.00',
      availableSeats: 20,
      cabin: 'economy',
    },
    {
      origin: 'Boston (BOS)',
      destination: 'Dublin (DUB)',
      departureTime: new Date('2026-09-05T09:30:00Z'),
      durationMinutes: 390,
      price: '380.00',
      availableSeats: 55,
      cabin: 'economy',
    },
    {
      origin: 'Seattle (SEA)',
      destination: 'Vancouver (YVR)',
      departureTime: new Date('2026-07-28T16:00:00Z'),
      durationMinutes: 60,
      price: '150.00',
      availableSeats: 100,
      cabin: 'economy',
    },

    // ── Premium / business / first variants of popular routes
    {
      origin: 'New York (JFK)',
      destination: 'London (LHR)',
      departureTime: new Date('2026-07-15T20:00:00Z'),
      durationMinutes: 420,
      price: '1450.00',
      availableSeats: 18,
      cabin: 'business',
    },
    {
      origin: 'Los Angeles (LAX)',
      destination: 'Tokyo (NRT)',
      departureTime: new Date('2026-07-20T22:30:00Z'),
      durationMinutes: 660,
      price: '2200.00',
      availableSeats: 8,
      cabin: 'first',
    },
    {
      origin: 'Chicago (ORD)',
      destination: 'Paris (CDG)',
      departureTime: new Date('2026-08-01T22:00:00Z'),
      durationMinutes: 510,
      price: '820.00',
      availableSeats: 24,
      cabin: 'premium',
    },

    // ── Return legs for round-trip bookings
    {
      origin: 'London (LHR)',
      destination: 'New York (JFK)',
      departureTime: new Date('2026-07-22T11:00:00Z'),
      durationMinutes: 480,
      price: '470.00',
      availableSeats: 50,
      cabin: 'economy',
    },
    {
      origin: 'Tokyo (NRT)',
      destination: 'Los Angeles (LAX)',
      departureTime: new Date('2026-07-27T18:30:00Z'),
      durationMinutes: 615,
      price: '760.00',
      availableSeats: 28,
      cabin: 'economy',
    },
    {
      origin: 'Paris (CDG)',
      destination: 'Chicago (ORD)',
      departureTime: new Date('2026-08-08T13:00:00Z'),
      durationMinutes: 555,
      price: '540.00',
      availableSeats: 48,
      cabin: 'economy',
    },
    {
      origin: 'Cancun (CUN)',
      destination: 'Miami (MIA)',
      departureTime: new Date('2026-08-17T10:30:00Z'),
      durationMinutes: 120,
      price: '260.00',
      availableSeats: 75,
      cabin: 'economy',
    },
    {
      origin: 'Vancouver (YVR)',
      destination: 'Seattle (SEA)',
      departureTime: new Date('2026-08-04T08:30:00Z'),
      durationMinutes: 60,
      price: '155.00',
      availableSeats: 90,
      cabin: 'economy',
    },
    {
      origin: 'Dublin (DUB)',
      destination: 'Boston (BOS)',
      departureTime: new Date('2026-09-12T12:15:00Z'),
      durationMinutes: 415,
      price: '395.00',
      availableSeats: 60,
      cabin: 'economy',
    },
    {
      origin: 'Sydney (SYD)',
      destination: 'San Francisco (SFO)',
      departureTime: new Date('2026-09-04T11:30:00Z'),
      durationMinutes: 820,
      price: '1180.00',
      availableSeats: 22,
      cabin: 'economy',
    },
  ]);

  console.log('Seed completed successfully');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
