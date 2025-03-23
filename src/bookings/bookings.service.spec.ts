import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { ShowtimesService } from '../showtimes/showtimes.service';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';

const mockBookingsRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockShowtimesService = () => ({
  findById: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingsRepository: MockRepository<Booking>;
  let showtimesService: ShowtimesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useFactory: mockBookingsRepository,
        },
        {
          provide: ShowtimesService,
          useFactory: mockShowtimesService,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    bookingsRepository = module.get<MockRepository<Booking>>(
      getRepositoryToken(Booking),
    );
    showtimesService = module.get<ShowtimesService>(ShowtimesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a booking when seat is available', async () => {
      const createBookingDto: CreateBookingDto = {
        showtimeId: 1,
        seatNumber: 15,
        userId: '84438967-f68f-4fa0-b620-0f08217e76af',
      };

      const showtime = {
        id: 1,
        price: 20.2,
        movieId: 1,
        theater: 'Theater 1',
        startTime: new Date('2025-02-14T11:47:46.125Z'),
        endTime: new Date('2025-02-14T14:47:46.125Z'),
      };

      const newBooking = {
        bookingId: 'd1a6423b-4469-4b00-8c5f-e3cfc42eacae',
        ...createBookingDto,
      };

      jest.spyOn(showtimesService, 'findById').mockResolvedValue(showtime as any);
      bookingsRepository.findOne.mockResolvedValue(null); // No existing booking
      bookingsRepository.create.mockReturnValue(newBooking);
      bookingsRepository.save.mockResolvedValue(newBooking);

      const result = await service.create(createBookingDto);
      
      expect(result).toEqual({ bookingId: newBooking.bookingId });
      expect(showtimesService.findById).toHaveBeenCalledWith(createBookingDto.showtimeId);
      expect(bookingsRepository.findOne).toHaveBeenCalledWith({
        where: {
          showtimeId: createBookingDto.showtimeId,
          seatNumber: createBookingDto.seatNumber,
        },
      });
      expect(bookingsRepository.create).toHaveBeenCalledWith(createBookingDto);
      expect(bookingsRepository.save).toHaveBeenCalledWith(newBooking);
    });

    it('should throw ConflictException when seat is already booked', async () => {
      const createBookingDto: CreateBookingDto = {
        showtimeId: 1,
        seatNumber: 15,
        userId: '84438967-f68f-4fa0-b620-0f08217e76af',
      };

      const showtime = {
        id: 1,
        price: 20.2,
        movieId: 1,
        theater: 'Theater 1',
        startTime: new Date('2025-02-14T11:47:46.125Z'),
        endTime: new Date('2025-02-14T14:47:46.125Z'),
      };

      const existingBooking = {
        bookingId: 'existing-booking-id',
        showtimeId: 1,
        seatNumber: 15,
        userId: 'another-user-id',
      };

      jest.spyOn(showtimesService, 'findById').mockResolvedValue(showtime as any);
      bookingsRepository.findOne.mockResolvedValue(existingBooking);

      await expect(service.create(createBookingDto)).rejects.toThrow(
        ConflictException,
      );
      
      expect(showtimesService.findById).toHaveBeenCalledWith(createBookingDto.showtimeId);
      expect(bookingsRepository.findOne).toHaveBeenCalledWith({
        where: {
          showtimeId: createBookingDto.showtimeId,
          seatNumber: createBookingDto.seatNumber,
        },
      });
      expect(bookingsRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when showtime does not exist', async () => {
      const createBookingDto: CreateBookingDto = {
        showtimeId: 999,
        seatNumber: 15,
        userId: '84438967-f68f-4fa0-b620-0f08217e76af',
      };

      jest.spyOn(showtimesService, 'findById').mockRejectedValue(
        new NotFoundException(`Showtime with ID ${createBookingDto.showtimeId} not found`)
      );

      await expect(service.create(createBookingDto)).rejects.toThrow(
        NotFoundException,
      );
      
      expect(showtimesService.findById).toHaveBeenCalledWith(createBookingDto.showtimeId);
      expect(bookingsRepository.findOne).not.toHaveBeenCalled();
      expect(bookingsRepository.save).not.toHaveBeenCalled();
    });
  });
});