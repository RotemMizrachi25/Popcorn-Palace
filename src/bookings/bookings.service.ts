import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ShowtimesService } from '../showtimes/showtimes.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    private showtimesService: ShowtimesService,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<{ bookingId: string }> {
    // Check if showtime exists
    await this.showtimesService.findById(createBookingDto.showtimeId);

    // Check if seat is already booked for this showtime
    const existingBooking = await this.bookingsRepository.findOne({
      where: {
        showtimeId: createBookingDto.showtimeId,
        seatNumber: createBookingDto.seatNumber,
      },
    });

    if (existingBooking) {
      throw new ConflictException(
        `Seat ${createBookingDto.seatNumber} is already booked for this showtime`,
      );
    }

    // Create booking
    const booking = this.bookingsRepository.create(createBookingDto);
    const savedBooking = await this.bookingsRepository.save(booking);

    return { bookingId: savedBooking.bookingId };
  }
}