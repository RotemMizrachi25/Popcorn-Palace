import { Test, TestingModule } from '@nestjs/testing';
import { ShowtimesController } from './showtimes.controller';
import { ShowtimesService } from './showtimes.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ShowtimesController', () => {
  let controller: ShowtimesController;
  let service: ShowtimesService;

  beforeEach(async () => {
    const mockShowtimesService = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShowtimesController],
      providers: [
        {
          provide: ShowtimesService,
          useValue: mockShowtimesService,
        },
      ],
    }).compile();

    controller = module.get<ShowtimesController>(ShowtimesController);
    service = module.get<ShowtimesService>(ShowtimesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findById', () => {
    it('should return a showtime when it exists', async () => {
      const showtimeId = 1;
      const serviceResponse = {
        id: showtimeId,
        price: 20.2,
        movieId: 1,
        theater: 'Theater 1',
        startTime: new Date('2025-02-14T11:47:46.125Z'),
        endTime: new Date('2025-02-14T14:47:46.125Z'),
      };
      
      jest.spyOn(service, 'findById').mockResolvedValue(serviceResponse);

      const result = await controller.findById(showtimeId);
      
      // The controller should return the exact response from the service
      expect(result).toBe(serviceResponse);
      expect(service.findById).toHaveBeenCalledWith(showtimeId);
    });

    it('should throw NotFoundException when showtime does not exist', async () => {
      const showtimeId = 999;
      
      jest.spyOn(service, 'findById').mockRejectedValue(new NotFoundException());

      await expect(controller.findById(showtimeId)).rejects.toThrow(
        NotFoundException,
      );
      
      expect(service.findById).toHaveBeenCalledWith(showtimeId);
    });
  });

  describe('create', () => {
    it('should create a new showtime', async () => {
      const createShowtimeDto: CreateShowtimeDto = {
        movieId: 1,
        price: 20.2,
        theater: 'Theater 1',
        startTime: '2025-02-14T11:47:46.125Z',
        endTime: '2025-02-14T14:47:46.125Z',
      };
      
      const serviceResponse = {
        id: 1,
        price: 20.2,
        movieId: 1,
        theater: 'Theater 1',
        startTime: new Date(createShowtimeDto.startTime),
        endTime: new Date(createShowtimeDto.endTime),
      };
      
      jest.spyOn(service, 'create').mockResolvedValue(serviceResponse);

      const result = await controller.create(createShowtimeDto);
      
      expect(result).toBe(serviceResponse);
      expect(service.create).toHaveBeenCalledWith(createShowtimeDto);
    });

    it('should handle BadRequestException when there are overlapping showtimes', async () => {
      const createShowtimeDto: CreateShowtimeDto = {
        movieId: 1,
        price: 20.2,
        theater: 'Theater 1',
        startTime: '2025-02-14T11:47:46.125Z',
        endTime: '2025-02-14T14:47:46.125Z',
      };
      
      const errorMessage = 'There is already a showtime in theater Theater 1 during this time period';
      
      jest.spyOn(service, 'create').mockRejectedValue(
        new BadRequestException(errorMessage),
      );

      await expect(controller.create(createShowtimeDto)).rejects.toThrow(
        BadRequestException,
      );
      
      expect(service.create).toHaveBeenCalledWith(createShowtimeDto);
    });

    it('should handle BadRequestException for invalid date formats', async () => {
      const invalidShowtimeDto = {
        movieId: 1,
        price: 20.2,
        theater: 'Theater 1',
        startTime: '2025-02-14', // Invalid format (missing time and timezone)
        endTime: '2025-02-14T14:47:46.125Z',
      } as any;
      
      const errorMessage = 'startTime must be a full ISO date with timezone';
      
      jest.spyOn(service, 'create').mockRejectedValue(
        new BadRequestException(errorMessage),
      );

      await expect(controller.create(invalidShowtimeDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a showtime', async () => {
      const showtimeId = 1;
      const updateShowtimeDto: CreateShowtimeDto = {
        movieId: 1,
        price: 25.0,
        theater: 'Updated Theater',
        startTime: '2025-02-14T12:00:00.000Z',
        endTime: '2025-02-14T15:00:00.000Z',
      };
      
      jest.spyOn(service, 'update').mockResolvedValue(undefined);

      await controller.update(showtimeId, updateShowtimeDto);
      
      expect(service.update).toHaveBeenCalledWith(showtimeId, updateShowtimeDto);
    });

    it('should throw NotFoundException when showtime does not exist', async () => {
      const showtimeId = 999;
      const updateShowtimeDto: CreateShowtimeDto = {
        movieId: 1,
        price: 25.0,
        theater: 'Updated Theater',
        startTime: '2025-02-14T12:00:00.000Z',
        endTime: '2025-02-14T15:00:00.000Z',
      };
      
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException());

      await expect(controller.update(showtimeId, updateShowtimeDto)).rejects.toThrow(
        NotFoundException,
      );
      
      expect(service.update).toHaveBeenCalledWith(showtimeId, updateShowtimeDto);
    });
  });

  describe('delete', () => {
    it('should delete a showtime', async () => {
      const showtimeId = 1;
      
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      await controller.delete(showtimeId);
      
      expect(service.delete).toHaveBeenCalledWith(showtimeId);
    });

    it('should throw NotFoundException when showtime does not exist', async () => {
      const showtimeId = 999;
      
      jest.spyOn(service, 'delete').mockRejectedValue(new NotFoundException());

      await expect(controller.delete(showtimeId)).rejects.toThrow(
        NotFoundException,
      );
      
      expect(service.delete).toHaveBeenCalledWith(showtimeId);
    });
  });
});