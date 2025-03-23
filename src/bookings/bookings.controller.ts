import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @ApiOperation({ summary: 'Book a ticket' })
  @ApiResponse({ 
    status: 200, 
    description: 'The ticket has been successfully booked',
    schema: {
      properties: {
        bookingId: { type: 'string', format: 'uuid' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Showtime not found' })
  @ApiResponse({ status: 409, description: 'Seat already booked' })
  @Post()
  @HttpCode(200)
  create(@Body() createBookingDto: CreateBookingDto): Promise<{ bookingId: string }> {
    return this.bookingsService.create(createBookingDto);
  }
}