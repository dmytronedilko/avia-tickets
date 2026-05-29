import { Pool } from 'pg';

async function migrate(): Promise<void> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "name" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "flights" (
        "id" SERIAL PRIMARY KEY,
        "origin" VARCHAR(255) NOT NULL,
        "destination" VARCHAR(255) NOT NULL,
        "departure_time" TIMESTAMP NOT NULL,
        "price" NUMERIC(10, 2) NOT NULL,
        "available_seats" INTEGER NOT NULL DEFAULT 0
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "bookings" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "flight_id" INTEGER NOT NULL REFERENCES "flights"("id"),
        "booking_time" TIMESTAMP DEFAULT NOW() NOT NULL,
        "status" VARCHAR(50) NOT NULL DEFAULT 'confirmed'
      );
    `);

    // Add duration_minutes column. Nullable first so backfill can run on existing rows.
    await client.query(`
      ALTER TABLE "flights"
      ADD COLUMN IF NOT EXISTS "duration_minutes" INTEGER;
    `);

    // Backfill seed routes with realistic durations.
    const routeDurations: [string, string, number][] = [
      ['New York%', 'London%', 420],
      ['Los Angeles%', 'Tokyo%', 660],
      ['Chicago%', 'Paris%', 510],
      ['Miami%', 'Cancun%', 120],
      ['San Francisco%', 'Sydney%', 840],
      ['Boston%', 'Dublin%', 390],
      ['Seattle%', 'Vancouver%', 60],
    ];
    for (const [originPat, destPat, minutes] of routeDurations) {
      await client.query(
        `UPDATE "flights"
         SET "duration_minutes" = $3
         WHERE "duration_minutes" IS NULL
           AND "origin" ILIKE $1
           AND "destination" ILIKE $2;`,
        [originPat, destPat, minutes],
      );
    }

    // Fallback for any remaining rows.
    await client.query(`
      UPDATE "flights"
      SET "duration_minutes" = 180
      WHERE "duration_minutes" IS NULL;
    `);

    await client.query(`
      ALTER TABLE "flights"
      ALTER COLUMN "duration_minutes" SET NOT NULL;
    `);

    await client.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "password_hash" VARCHAR(255);
    `);

    await client.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "balance" NUMERIC(12, 2) NOT NULL DEFAULT 0;
    `);

    await client.query(`
      ALTER TABLE "bookings"
      ADD COLUMN IF NOT EXISTS "price_paid" NUMERIC(10, 2) NOT NULL DEFAULT 0;
    `);

    await client.query(`
      ALTER TABLE "flights"
      ADD COLUMN IF NOT EXISTS "cabin" VARCHAR(32) NOT NULL DEFAULT 'economy';
    `);

    await client.query(`
      ALTER TABLE "bookings"
      ADD COLUMN IF NOT EXISTS "passengers" INTEGER NOT NULL DEFAULT 1;
    `);

    await client.query(`
      ALTER TABLE "bookings"
      ADD COLUMN IF NOT EXISTS "return_flight_id" INTEGER
      REFERENCES "flights"("id");
    `);

    console.log('Migrations completed successfully');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
