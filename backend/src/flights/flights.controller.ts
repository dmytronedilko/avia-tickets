import { Controller, Get, Query } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { SearchFlightsDto } from './dto/search-flights.dto';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get()
  async searchFlights(@Query() query: SearchFlightsDto) {
    return this.flightsService.searchFlights(query);
  }
}
