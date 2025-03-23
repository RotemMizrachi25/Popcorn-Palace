import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, BadRequestException } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from '../src/movies/entities/movie.entity';
import { Showtime } from '../src/showtimes/entities/showtime.entity';
import { Booking } from '../src/bookings/entities/booking.entity';
import { HttpExceptionFilter } from '../src/filters/http-exception.filter';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let movieId: number;
  let showtimeId: number;

  // Mock repositories
  const mockMoviesRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockShowtimesRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockBookingsRepo = {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(Movie))
      .useValue(mockMoviesRepo)
      .overrideProvider(getRepositoryToken(Showtime))
      .useValue(mockShowtimesRepo)
      .overrideProvider(getRepositoryToken(Booking))
      .useValue(mockBookingsRepo)
      .compile();

    app = moduleFixture.createNestApplication();
    
    // Set up validation pipe with custom exception factory
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        exceptionFactory: (errors) => {
          const formattedErrors = errors.map(error => {
            const constraints = error.constraints ? 
              Object.values(error.constraints).join(', ') : 
              'Invalid value';
            return `${error.property}: ${constraints}`;
          });
          return new BadRequestException({
            message: 'Validation failed',
            errors: formattedErrors
          });
        },
      }),
    );
    
    // Set up global exception filter
    app.useGlobalFilters(new HttpExceptionFilter());
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Movies API', () => {
    it('/movies/all (GET)', () => {
      const movies = [
        {
          id: 1,
          title: 'Test Movie',
          genre: 'Action',
          duration: 120,
          rating: 8.5,
          releaseYear: 2023,
        },
      ];
      mockMoviesRepo.find.mockResolvedValueOnce(movies);

      return request(app.getHttpServer())
        .get('/movies/all')
        .expect(200)
        .expect(movies);
    });

    it('/movies (POST)', () => {
      const createMovieDto = {
        title: 'New Movie',
        genre: 'Comedy',
        duration: 90,
        rating: 7.5,
        releaseYear: 2024,
      };

      const createdMovie = {
        id: 1,
        ...createMovieDto,
      };

      mockMoviesRepo.findOne.mockResolvedValueOnce(null); // No existing movie with same title
      mockMoviesRepo.create.mockReturnValueOnce(createdMovie);
      mockMoviesRepo.save.mockResolvedValueOnce(createdMovie);

      return request(app.getHttpServer())
        .post('/movies')
        .send(createMovieDto)
        .expect(200)
        .expect({
          id: createdMovie.id,
          title: createdMovie.title,
          genre: createdMovie.genre,
          duration: createdMovie.duration,
          rating: createdMovie.rating,
          releaseYear: createdMovie.releaseYear
        })
        .then(response => {
          movieId = response.body.id;
        });
    });

    it('/movies (POST) - validation fail', () => {
      const invalidMovieDto = {
        title: 'Invalid Movie',
        genre: 'Comedy',
        // Missing required fields
      };

      return request(app.getHttpServer())
        .post('/movies')
        .send(invalidMovieDto)
        .expect(400)
        .expect(res => {
          expect(res.body.message).toBe('Validation failed');
          expect(res.body.errors).toBeDefined();
        });
    });

    it('/movies (POST) - duplicate title', () => {
      const duplicateMovieDto = {
        title: 'Existing Movie',
        genre: 'Comedy',
        duration: 90,
        rating: 7.5,
        releaseYear: 2024,
      };

      const existingMovie = {
        id: 2,
        ...duplicateMovieDto,
      };

      mockMoviesRepo.findOne.mockResolvedValueOnce(existingMovie); // Existing movie with same title

      return request(app.getHttpServer())
        .post('/movies')
        .send(duplicateMovieDto)
        .expect(409)
        .expect(res => {
          expect(res.body.message).toContain('already exists');
        });
    });

    it('/movies/update/:movieTitle (POST)', () => {
      const movieTitle = 'Test Movie';
      const updateMovieDto = {
        title: 'Updated Movie',
        genre: 'Drama',
        duration: 110,
        rating: 8.0,
        releaseYear: 2022,
      };

      mockMoviesRepo.findOne.mockResolvedValueOnce({
        id: 1,
        title: movieTitle,
        genre: 'Action',
        duration: 120,
        rating: 8.5,
        releaseYear: 2023,
      });
      mockMoviesRepo.findOne.mockResolvedValueOnce(null); // No existing movie with new title
      mockMoviesRepo.update.mockResolvedValueOnce({ affected: 1 });

      return request(app.getHttpServer())
        .post(`/movies/update/${movieTitle}`)
        .send(updateMovieDto)
        .expect(200);
    });

    it('/movies/:movieTitle (DELETE)', () => {
      const movieTitle = 'Test Movie';
      mockMoviesRepo.delete.mockResolvedValueOnce({ affected: 1 });

      return request(app.getHttpServer())
        .delete(`/movies/${movieTitle}`)
        .expect(200);
    });
  });

  describe('Showtimes API', () => {
    it('/showtimes (POST)', () => {
      const createShowtimeDto = {
        movieId: movieId,
        price: 20.2,
        theater: 'Theater 1',
        startTime: '2025-02-14T11:47:46.125Z',
        endTime: '2025-02-14T14:47:46.125Z',
      };

      const createdShowtime = {
        id: 1,
        ...createShowtimeDto,
        startTime: new Date(createShowtimeDto.startTime),
        endTime: new Date(createShowtimeDto.endTime),
        movie: {
          id: movieId,
          title: 'Test Movie',
        },
      };

      mockMoviesRepo.findOne.mockResolvedValueOnce({ id: movieId });
      mockShowtimesRepo.findOne.mockResolvedValueOnce(null); // No overlapping showtime
      mockShowtimesRepo.create.mockReturnValueOnce(createdShowtime);
      mockShowtimesRepo.save.mockResolvedValueOnce(createdShowtime);

      return request(app.getHttpServer())
        .post('/showtimes')
        .send(createShowtimeDto)
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBeDefined();
          expect(res.body.price).toBe(createShowtimeDto.price);
          expect(res.body.movieId).toBe(createShowtimeDto.movieId);
          expect(res.body.theater).toBe(createShowtimeDto.theater);
          // Order of properties should be as specified
          const keys = Object.keys(res.body);
          expect(keys[0]).toBe('id');
          expect(keys[1]).toBe('price');
          expect(keys[2]).toBe('movieId');
          expect(keys[3]).toBe('theater');
          showtimeId = res.body.id;
        });
    });

    it('/showtimes (POST) - invalid date format', () => {
      const invalidShowtimeDto = {
        movieId: movieId,
        price: 20.2,
        theater: 'Theater 1',
        startTime: '2025-02-14', // Invalid format (missing time and timezone)
        endTime: '2025-02-14T14:47:46.125Z',
      };

      return request(app.getHttpServer())
        .post('/showtimes')
        .send(invalidShowtimeDto)
        .expect(400)
        .expect(res => {
          expect(res.body.message).toBe('Validation failed');
          expect(res.body.errors).toBeDefined();
        });
    });

    it('/showtimes/:showtimeId (GET)', () => {
      const showtime = {
        id: showtimeId,
        price: 20.2,
        movieId: movieId,
        theater: 'Theater 1',
        startTime: new Date('2025-02-14T11:47:46.125Z'),
        endTime: new Date('2025-02-14T14:47:46.125Z'),
        movie: {
          id: movieId,
          title: 'Test Movie',
        },
      };

      const expectedResponse = {
        id: showtimeId,
        price: 20.2,
        movieId: movieId,
        theater: 'Theater 1',
        startTime: showtime.startTime.toISOString(),
        endTime: showtime.endTime.toISOString(),
      };

      mockShowtimesRepo.findOne.mockResolvedValueOnce(showtime);

      return request(app.getHttpServer())
        .get(`/showtimes/${showtimeId}`)
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(expectedResponse.id);
          expect(res.body.price).toBe(expectedResponse.price);
          expect(res.body.movieId).toBe(expectedResponse.movieId);
          expect(res.body.theater).toBe(expectedResponse.theater);
          
          // Order of properties should be as specified
          const keys = Object.keys(res.body);
          expect(keys[0]).toBe('id');
          expect(keys[1]).toBe('price');
          expect(keys[2]).toBe('movieId');
          expect(keys[3]).toBe('theater');
        });
    });

    it('/showtimes/update/:showtimeId (POST)', () => {
      const updateShowtimeDto = {
        movieId: movieId,
        price: 25.0,
        theater: 'Updated Theater',
        startTime: '2025-02-14T12:00:00.000Z',
        endTime: '2025-02-14T15:00:00.000Z',
      };

      mockShowtimesRepo.findOne.mockResolvedValueOnce({
        id: showtimeId,
        movieId: movieId,
        price: 20.2,
        theater: 'Theater 1',
        startTime: new Date('2025-02-14T11:47:46.125Z'),
        endTime: new Date('2025-02-14T14:47:46.125Z'),
        movie: {
          id: movieId,
          title: 'Test Movie',
        },
      });

      mockMoviesRepo.findOne.mockResolvedValueOnce({ id: movieId });
      mockShowtimesRepo.findOne.mockResolvedValueOnce(null); // No overlapping showtime

      return request(app.getHttpServer())
        .post(`/showtimes/update/${showtimeId}`)
        .send(updateShowtimeDto)
        .expect(200);
    });

    it('/showtimes/:showtimeId (DELETE)', () => {
      mockShowtimesRepo.delete.mockResolvedValueOnce({ affected: 1 });

      return request(app.getHttpServer())
        .delete(`/showtimes/${showtimeId}`)
        .expect(200);
    });
  });

  describe('Bookings API', () => {
    it('/bookings (POST)', () => {
      const createBookingDto = {
        showtimeId: showtimeId,
        seatNumber: 15,
        userId: '84438967-f68f-4fa0-b620-0f08217e76af',
      };

      const createdBooking = {
        bookingId: 'd1a6423b-4469-4b00-8c5f-e3cfc42eacae',
        ...createBookingDto,
      };

      mockShowtimesRepo.findOne.mockResolvedValueOnce({
        id: showtimeId,
        movieId: movieId,
        price: 20.2,
        theater: 'Theater 1',
        startTime: new Date('2025-02-14T11:47:46.125Z'),
        endTime: new Date('2025-02-14T14:47:46.125Z'),
      });
      
      mockBookingsRepo.findOne.mockResolvedValueOnce(null); // No existing booking
      mockBookingsRepo.create.mockReturnValueOnce(createdBooking);
      mockBookingsRepo.save.mockResolvedValueOnce(createdBooking);

      return request(app.getHttpServer())
        .post('/bookings')
        .send(createBookingDto)
        .expect(200)
        .expect({ bookingId: createdBooking.bookingId });
    });

    it('/bookings (POST) - seat already booked', () => {
      const createBookingDto = {
        showtimeId: showtimeId,
        seatNumber: 15,
        userId: 'another-user-id',
      };

      mockShowtimesRepo.findOne.mockResolvedValueOnce({
        id: showtimeId,
        movieId: movieId,
        price: 20.2,
        theater: 'Theater 1',
        startTime: new Date('2025-02-14T11:47:46.125Z'),
        endTime: new Date('2025-02-14T14:47:46.125Z'),
      });
      
      mockBookingsRepo.findOne.mockResolvedValueOnce({
        bookingId: 'existing-booking-id',
        showtimeId: showtimeId,
        seatNumber: 15,
        userId: '84438967-f68f-4fa0-b620-0f08217e76af',
      });

      return request(app.getHttpServer())
        .post('/bookings')
        .send(createBookingDto)
        .expect(409) // Conflict status code
        .expect(res => {
          expect(res.body.message).toContain('already booked');
        });
    });

    it('/bookings (POST) - validation errors', () => {
      const invalidBookingDto = {
        // Missing required fields
        showtimeId: showtimeId,
        // No seatNumber
        // No userId
      };

      return request(app.getHttpServer())
        .post('/bookings')
        .send(invalidBookingDto)
        .expect(400)
        .expect(res => {
          expect(res.body.message).toBe('Validation failed');
          expect(res.body.errors).toBeDefined();
        });
    });
  });
});