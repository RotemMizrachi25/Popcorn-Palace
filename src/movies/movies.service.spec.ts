import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';

const mockMoviesRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('MoviesService', () => {
  let service: MoviesService;
  let moviesRepository: MockRepository<Movie>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useFactory: mockMoviesRepository,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    moviesRepository = module.get<MockRepository<Movie>>(getRepositoryToken(Movie));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
      moviesRepository.find.mockResolvedValue(expectedMovies);

      const result = await service.findAll();
      expect(result).toEqual(expectedMovies);
      expect(moviesRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a movie when it exists', async () => {
      const movieId = 1;
      const expectedMovie = { 
        id: movieId, 
        title: 'Test Movie', 
        genre: 'Action', 
        duration: 120, 
        rating: 8.5, 
        releaseYear: 2023 
      };
      
      moviesRepository.findOne.mockResolvedValue(expectedMovie);

      const result = await service.findOne(movieId);
      expect(result).toEqual(expectedMovie);
      expect(moviesRepository.findOne).toHaveBeenCalledWith({ where: { id: movieId } });
    });

    it('should throw an error if movie does not exist', async () => {
      const movieId = 999;
      moviesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(movieId)).rejects.toThrow(NotFoundException);
      expect(moviesRepository.findOne).toHaveBeenCalledWith({ where: { id: movieId } });
    });
  });

  describe('create', () => {
    it('should create and return a movie', async () => {
      const createMovieDto = { 
        title: 'New Movie', 
        genre: 'Comedy', 
        duration: 90, 
        rating: 7.5, 
        releaseYear: 2024 
      };
      
      const newMovie = { id: 1, ...createMovieDto };
      
      moviesRepository.findOne.mockResolvedValue(null); // No existing movie with same title
      moviesRepository.create.mockReturnValue(newMovie);
      moviesRepository.save.mockResolvedValue(newMovie);

      const result = await service.create(createMovieDto);
      
      expect(result).toEqual({
        id: newMovie.id,
        title: newMovie.title,
        genre: newMovie.genre,
        duration: newMovie.duration,
        rating: newMovie.rating,
        releaseYear: newMovie.releaseYear
      });
      expect(moviesRepository.findOne).toHaveBeenCalledWith({ where: { title: createMovieDto.title } });
      expect(moviesRepository.create).toHaveBeenCalledWith(createMovieDto);
      expect(moviesRepository.save).toHaveBeenCalledWith(newMovie);
    });

    it('should throw ConflictException if movie with same title exists', async () => {
      const createMovieDto = { 
        title: 'Existing Movie', 
        genre: 'Comedy', 
        duration: 90, 
        rating: 7.5, 
        releaseYear: 2024 
      };
      
      const existingMovie = { id: 1, ...createMovieDto };
      
      moviesRepository.findOne.mockResolvedValue(existingMovie);

      await expect(service.create(createMovieDto)).rejects.toThrow(ConflictException);
      expect(moviesRepository.findOne).toHaveBeenCalledWith({ where: { title: createMovieDto.title } });
      expect(moviesRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a movie successfully', async () => {
      const movieTitle = 'Test Movie';
      const updateMovieDto = { 
        title: 'Updated Movie', 
        genre: 'Drama', 
        duration: 110, 
        rating: 8.0, 
        releaseYear: 2022 
      };
      
      const existingMovie = { 
        id: 1, 
        title: movieTitle, 
        genre: 'Action', 
        duration: 120, 
        rating: 8.5, 
        releaseYear: 2023 
      };
      
      // First findOne checks if the movie to update exists
      moviesRepository.findOne.mockResolvedValueOnce(existingMovie);
      // Second findOne checks if the new title already exists (for different movie)
      moviesRepository.findOne.mockResolvedValueOnce(null);
      moviesRepository.update.mockResolvedValue({ affected: 1 });

      await service.update(movieTitle, updateMovieDto);
      
      expect(moviesRepository.findOne).toHaveBeenCalledWith({ where: { title: movieTitle } });
      expect(moviesRepository.findOne).toHaveBeenCalledWith({ where: { title: updateMovieDto.title } });
      expect(moviesRepository.update).toHaveBeenCalledWith({ title: movieTitle }, updateMovieDto);
    });

    it('should throw NotFoundException if movie to update does not exist', async () => {
      const movieTitle = 'Non-existent Movie';
      const updateMovieDto = { 
        title: 'Updated Movie', 
        genre: 'Drama', 
        duration: 110, 
        rating: 8.0, 
        releaseYear: 2022 
      };
      
      moviesRepository.findOne.mockResolvedValue(null);

      await expect(service.update(movieTitle, updateMovieDto)).rejects.toThrow(
        NotFoundException,
      );
      
      expect(moviesRepository.findOne).toHaveBeenCalledWith({ where: { title: movieTitle } });
      expect(moviesRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if new title already exists for another movie', async () => {
      const movieTitle = 'Test Movie';
      const updateMovieDto = { 
        title: 'Existing Title', 
        genre: 'Drama', 
        duration: 110, 
        rating: 8.0, 
        releaseYear: 2022 
      };
      
      const existingMovie = { 
        id: 1, 
        title: movieTitle, 
        genre: 'Action', 
        duration: 120, 
        rating: 8.5, 
        releaseYear: 2023 
      };
      
      const anotherMovie = {
        id: 2,
        title: 'Existing Title',
        genre: 'Comedy',
        duration: 95,
        rating: 7.0,
        releaseYear: 2021
      };
      
      // First findOne checks if the movie to update exists
      moviesRepository.findOne.mockResolvedValueOnce(existingMovie);
      // Second findOne checks if the new title already exists (for different movie)
      moviesRepository.findOne.mockResolvedValueOnce(anotherMovie);

      await expect(service.update(movieTitle, updateMovieDto)).rejects.toThrow(
        ConflictException,
      );
      
      expect(moviesRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a movie successfully', async () => {
      const movieTitle = 'Test Movie';
      moviesRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(movieTitle);
      
      expect(moviesRepository.delete).toHaveBeenCalledWith({ title: movieTitle });
    });

    it('should throw NotFoundException if movie to delete does not exist', async () => {
      const movieTitle = 'Non-existent Movie';
      moviesRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(movieTitle)).rejects.toThrow(
        NotFoundException,
      );
      
      expect(moviesRepository.delete).toHaveBeenCalledWith({ title: movieTitle });
    });
  });
});