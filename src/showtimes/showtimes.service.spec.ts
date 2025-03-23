import { Test, TestingModule } from '@nestjs/testing';
import { ShowtimesService } from './showtimes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Showtime } from './entities/showtime.entity';
import { MoviesService } from '../movies/movies.service';
import { Repository, Not, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateShowtimeDto } from './dto/create-showtime.dto';

const mockShowtimesRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockMoviesService = () => ({
  findOne: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ShowtimesService', () => {
  let service: ShowtimesService;
  let showtimesRepository: MockRepository<Showtime>;
  let moviesService: MoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowtimesService,
        {
          provide: getRepositoryToken(Showtime),
          useFactory: mockShowtimesRepository,
        },
        {
          provide: MoviesService,
          useFactory: mockMoviesService,
        },
      ],
    }).compile();

    service = module.get<ShowtimesService>(ShowtimesService);
    showtimesRepository = module.get<MockRepository<Showtime>>(
      getRepositoryToken(Showtime),
    );
    moviesService = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a formatted showtime when it exists', async () => {
      const showtimeId = 1;
      const existingShowtime = {
        id: showtimeId,
        movieId: 1,
        price: 20.2,
        theater: 'Theater 1',
        startTime: new Date('2025-02-14T11:47:46.125Z'),
        endTime: new Date('2025-02-14T14:47:46.125Z'),
        movie: {
          id: 1,
          title: 'Test Movie',
        },
      };

      const expectedResponse = {
        id: showtimeId,
        price: 20.2,
        movieId: 1,
        theater: 'Theater 1',
        startTime: existingShowtime.startTime,
        endTime: existingShowtime.endTime,
      };

      showtimesRepository.findOne.mockResolvedValue(existingShowtime);

      const result = await service.findById(showtimeId);
      
      expect(result).toEqual(expectedResponse);
      expect(showtimesRepository.findOne).toHaveBeenCalledWith({
        where: { id: showtimeId },
      });
    });

    it('should throw NotFoundException when showtime does not exist', async () => {
      const showtimeId = 999;
      
      showtimesRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(showtimeId)).rejects.toThrow(
        NotFoundException,
      );
      
      expect(showtimesRepository.findOne).toHaveBeenCalledWith({
        where: { id: showtimeId },
      });
    });
  });

  describe('create', () => {
    it('should create a showtime and return formatted response when all validations pass', async () => {
      const createShowtimeDto: CreateShowtimeDto = {
        movieId: 1,
        price: 20.2,
        theater: 'Theater 1',
        startTime: '2025-02-14T11:47:46.125Z',
        endTime: '2025-02-14T14:47:46.125Z',
      };

      const startTime = new Date(createShowtimeDto.startTime);
      const endTime = new Date(createShowtimeDto.endTime);

      const movie = {
        id: 1,
        title: 'Test Movie',
        genre: 'Action',
        duration: 120,
        rating: 8.5,
        releaseYear: 2023,
      };

      const newShowtime = {
        id: 1,
        ...createShowtimeDto,
        startTime,
        endTime,
        movie,
      };

      const expectedResponse = {
        id: 1,
        price: 20.2,
        movieId: 1,
        theater: 'Theater 1',
        startTime,
        endTime,
      };

      jest.spyOn(moviesService, 'findOne').mockResolvedValue(movie);
      showtimesRepository.findOne.mockResolvedValue(null); // No overlapping showtime
      showtimesRepository.create.mockReturnValue(newShowtime);
      showtimesRepository.save.mockResolvedValue(newShowtime);

      const result = await service.create(createShowtimeDto);
      
      expect(result).toEqual(expectedResponse);
      expect(moviesService.findOne).toHaveBeenCalledWith(createShowtimeDto.movieId);
      expect(showtimesRepository.findOne).toHaveBeenCalled();
      expect(showtimesRepository.create).toHaveBeenCalledWith({
        ...createShowtimeDto,
        startTime,
        endTime,
      });
      expect(showtimesRepository.save).toHaveBeenCalledWith(newShowtime);
    });

    it('should throw BadRequestException when end time is before start time', async () => {
      const createShowtimeDto: CreateShowtimeDto = {
        movieId: 1,
        price: 20.2,
        theater: 'Theater 1',
        startTime: '2025-02-14T14:47:46.125Z', // End time is before start time
        endTime: '2025-02-14T11:47:46.125Z',
      };

      jest.spyOn(moviesService, 'findOne').mockResolvedValue({} as any);

      await expect(service.create(createShowtimeDto)).rejects.toThrow(
        BadRequestException,
      );
      
      expect(moviesService.findOne).toHaveBeenCalledWith(createShowtimeDto.movieId);
      expect(showtimesRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when there is an overlapping showtime', async () => {
      const createShowtimeDto: CreateShowtimeDto = {
        movieId: 1,
        price: 20.2,
        theater: 'Theater 1',
        startTime: '2025-02-14T11:47:46.125Z',
        endTime: '2025-02-14T14:47:46.125Z',
      };

      const existingShowtime = {
        id: 1,
        movieId: 2,
        price: 15.0,
        theater: 'Theater 1',
        startTime: new Date('2025-02-14T13:00:00.000Z'),
        endTime: new Date('2025-02-14T15:00:00.000Z'),
      };

      jest.spyOn(moviesService, 'findOne').mockResolvedValue({} as any);
      showtimesRepository.findOne.mockResolvedValue(existingShowtime);

      await expect(service.create(createShowtimeDto)).rejects.toThrow(
        BadRequestException,
      );
      
      expect(moviesService.findOne).toHaveBeenCalledWith(createShowtimeDto.movieId);
      expect(showtimesRepository.save).not.toHaveBeenCalled();
    });

    it('should handle invalid date formats gracefully', async () => {
      const invalidShowtimeDto = {
        movieId: 1,
        price: 20.2,
        theater: 'Theater 1',
        startTime: '2025-02-14', // Invalid format
        endTime: '2025-02-14T14:47:46.125Z',
      } as any; // Use 'as any' to bypass TypeScript checks
      
      // We expect some kind of error, but we don't care specifically about BadRequestException
      // because date validation happens at the DTO/controller level
      await expect(service.create(invalidShowtimeDto)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a showtime when all validations pass', async () => {
      const showtimeId = 1;
      const updateShowtimeDto: CreateShowtimeDto = {
        movieId: 1,
        price: 25.0,
        theater: 'Updated Theater',
        startTime: '2025-02-14T12:00:00.000Z',
        endTime: '2025-02-14T15:00:00.000Z',
      };

      const existingShowtime = {
        id: showtimeId,
        movieId: 1,
        price: 20.2,
        theater: 'Theater 1',
        startTime: new Date('2025-02-14T11:47:46.125Z'),
        endTime: new Date('2025-02-14T14:47:46.125Z'),
      };

      jest.spyOn(moviesService, 'findOne').mockResolvedValue({} as any);
      showtimesRepository.findOne.mockResolvedValueOnce(existingShowtime); // Find showtime to update
      showtimesRepository.findOne.mockResolvedValueOnce(null); // No overlapping showtime

      await service.update(showtimeId, updateShowtimeDto);
      
      expect(showtimesRepository.findOne).toHaveBeenCalledWith({
        where: { id: showtimeId },});
      expect(moviesService.findOne).toHaveBeenCalledWith(updateShowtimeDto.movieId);
      expect(showtimesRepository.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a showtime when it exists', async () => {
      const showtimeId = 1;
      
      showtimesRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(showtimeId);
      
      expect(showtimesRepository.delete).toHaveBeenCalledWith(showtimeId);
    });

    it('should throw NotFoundException when showtime does not exist', async () => {
      const showtimeId = 999;
      
      showtimesRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(showtimeId)).rejects.toThrow(
        NotFoundException,
      );
      
      expect(showtimesRepository.delete).toHaveBeenCalledWith(showtimeId);
    });
  });
});