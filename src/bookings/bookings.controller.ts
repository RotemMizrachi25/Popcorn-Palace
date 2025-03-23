import { Controller, Post, Body, HttpCode, UsePipes, ValidationPipe } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  create(@Body() createBookingDto: CreateBookingDto): Promise<{ bookingId: string }> {
    return this.bookingsService.create(createBookingDto);
  }
}