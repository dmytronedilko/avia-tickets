import { Module } from '@nestjs/common';
import { DrizzleModule } from './db/drizzle.module';
import { FlightsModule } from './flights/flights.module';
import { BookingsModule } from './bookings/bookings.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    DrizzleModule,
    UsersModule,
    AuthModule,
    FlightsModule,
    BookingsModule,
  ],
})
export class AppModule {}
