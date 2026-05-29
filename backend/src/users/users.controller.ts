import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthedUser } from '../auth/jwt.strategy';
import { UsersService } from './users.service';
import { TopUpDto } from './dto/top-up.dto';

@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  me(@CurrentUser() user: AuthedUser) {
    return this.users.getById(user.id);
  }

  @Post('top-up')
  topUp(@CurrentUser() user: AuthedUser, @Body() dto: TopUpDto) {
    return this.users.topUp(user.id, dto.amount);
  }
}
