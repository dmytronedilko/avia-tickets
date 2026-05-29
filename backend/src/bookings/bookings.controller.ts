import {
  Controller,
  Post,
  Patch,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthedUser } from '../auth/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  createBooking(
    @CurrentUser() user: AuthedUser,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.createBooking(user.id, {
      flightId: dto.flightId,
      returnFlightId: dto.returnFlightId,
      passengers: dto.passengers,
    });
  }

  @Get('me')
  listMine(@CurrentUser() user: AuthedUser) {
    return this.bookingsService.listForUser(user.id);
  }

  @Patch(':id/cancel')
  cancel(
    @CurrentUser() user: AuthedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bookingsService.cancelBooking(user.id, id);
  }
}
