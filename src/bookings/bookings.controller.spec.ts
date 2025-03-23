import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('BookingsController', () => {
  let controller: BookingsController;
  let service: BookingsService;

  beforeEach(async () => {
    const mockBookingsService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: mockBookingsService,
        },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
    service = module.get<BookingsService>(BookingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new booking', async () => {
      const createBookingDto: CreateBookingDto = {
        showtimeId: 1,
        seatNumber: 15,
        userId: '84438967-f68f-4fa0-b620-0f08217e76af',
      };
      
      const expectedResult = {
        bookingId: 'd1a6423b-4469-4b00-8c5f-e3cfc42eacae',
      };
      
      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      expect(await controller.create(createBookingDto)).toBe(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createBookingDto);
    });

    it('should handle conflict exceptions when seat is already booked', async () => {
      const createBookingDto: CreateBookingDto = {
        showtimeId: 1,
        seatNumber: 15,
        userId: '84438967-f68f-4fa0-b620-0f08217e76af',
      };
      
      const errorMessage = 'Seat 15 is already booked for this showtime';
      
      jest.spyOn(service, 'create').mockRejectedValue(
        new ConflictException(errorMessage),
      );

      await expect(controller.create(createBookingDto)).rejects.toThrow(
        ConflictException,
      );
      
      expect(service.create).toHaveBeenCalledWith(createBookingDto);
    });

    it('should handle not found exceptions when showtime does not exist', async () => {
      const createBookingDto: CreateBookingDto = {
        showtimeId: 999,
        seatNumber: 15,
        userId: '84438967-f68f-4fa0-b620-0f08217e76af',
      };
      
      const errorMessage = 'Showtime with ID 999 not found';
      
      jest.spyOn(service, 'create').mockRejectedValue(
        new NotFoundException(errorMessage),
      );

      await expect(controller.create(createBookingDto)).rejects.toThrow(
        NotFoundException,
      );
      
      expect(service.create).toHaveBeenCalledWith(createBookingDto);
    });
  });
});