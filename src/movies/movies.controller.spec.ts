import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';

describe('MoviesController', () => {
  let controller: MoviesController;
  let service: MoviesService;

  beforeEach(async () => {
    const mockMoviesService = {
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: mockMoviesService,
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    service = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of movies', async () => {
      const expectedMovies = [
        { 
          id: 1, 
          title: 'Test Movie', 
          genre: 'Action', 
          duration: 120, 
          rating: 8.5, 
          releaseYear: 2023 
        },
      ];
      
      jest.spyOn(service, 'findAll').mockResolvedValue(expectedMovies);

      expect(await controller.findAll()).toBe(expectedMovies);
    });
  });

  describe('create', () => {
    it('should create a new movie', async () => {
      const createMovieDto: CreateMovieDto = {
        title: 'New Movie',
        genre: 'Comedy',
        duration: 90,
        rating: 7.5,
        releaseYear: 2024,
      };
      
      const expectedMovie = {
        id: 1,
        title: 'New Movie',
        genre: 'Comedy',
        duration: 90,
        rating: 7.5,
        releaseYear: 2024,
      };
      
      jest.spyOn(service, 'create').mockResolvedValue(expectedMovie);

      expect(await controller.create(createMovieDto)).toBe(expectedMovie);
      expect(service.create).toHaveBeenCalledWith(createMovieDto);
    });

    it('should handle conflict when movie title already exists', async () => {
      const createMovieDto: CreateMovieDto = {
        title: 'Existing Movie',
        genre: 'Comedy',
        duration: 90,
        rating: 7.5,
        releaseYear: 2024,
      };
      
      jest.spyOn(service, 'create').mockRejectedValue(
        new ConflictException(`A movie with the title "${createMovieDto.title}" already exists`)
      );

      await expect(controller.create(createMovieDto)).rejects.toThrow(
        ConflictException,
      );
      
      expect(service.create).toHaveBeenCalledWith(createMovieDto);
    });
  });

  describe('update', () => {
    it('should update a movie', async () => {
      const movieTitle = 'Test Movie';
      const updateMovieDto: CreateMovieDto = {
        title: 'Updated Movie',
        genre: 'Drama',
        duration: 110,
        rating: 8.0,
        releaseYear: 2022,
      };
      
      jest.spyOn(service, 'update').mockResolvedValue(undefined);

      await controller.update(movieTitle, updateMovieDto);
      
      expect(service.update).toHaveBeenCalledWith(movieTitle, updateMovieDto);
    });

    it('should throw an exception when movie does not exist', async () => {
      const movieTitle = 'Non-existent Movie';
      const updateMovieDto: CreateMovieDto = {
        title: 'Updated Movie',
        genre: 'Drama',
        duration: 110,
        rating: 8.0,
        releaseYear: 2022,
      };
      
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException());

      await expect(controller.update(movieTitle, updateMovieDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an exception when update would create duplicate title', async () => {
      const movieTitle = 'Test Movie';
      const updateMovieDto: CreateMovieDto = {
        title: 'Existing Movie',
        genre: 'Drama',
        duration: 110,
        rating: 8.0,
        releaseYear: 2022,
      };
      
      jest.spyOn(service, 'update').mockRejectedValue(
        new ConflictException(`A movie with the title "${updateMovieDto.title}" already exists`)
      );

      await expect(controller.update(movieTitle, updateMovieDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a movie', async () => {
      const movieTitle = 'Test Movie';
      
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      await controller.delete(movieTitle);
      
      expect(service.delete).toHaveBeenCalledWith(movieTitle);
    });

    it('should throw an exception when movie does not exist', async () => {
      const movieTitle = 'Non-existent Movie';
      
      jest.spyOn(service, 'delete').mockRejectedValue(new NotFoundException());

      await expect(controller.delete(movieTitle)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});