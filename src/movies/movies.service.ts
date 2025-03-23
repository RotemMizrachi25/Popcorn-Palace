import { Injectable, NotFoundException, ConflictException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private moviesRepository: Repository<Movie>,
  ) {}

  async findAll(): Promise<Movie[]> {
    const movies = await this.moviesRepository.find();
  
    return movies.map(movie => ({
      id: movie.id,
      title: movie.title,
      genre: movie.genre,
      duration: movie.duration,
      rating: movie.rating,
      releaseYear: movie.releaseYear
    }));
  }


 async findOne(id: number): Promise<Movie> {
    const movie = await this.moviesRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
    return movie;
  }

  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    try {
      // Check if a movie with this title already exists
      const existingMovie = await this.moviesRepository.findOne({ 
        where: { title: createMovieDto.title } 
      });
      
      if (existingMovie) {
        throw new ConflictException(`A movie with the title "${createMovieDto.title}" already exists`);
      }
      
      const movie = this.moviesRepository.create(createMovieDto);
      const savedMovie = await this.moviesRepository.save(movie);
  
      // Return with id first
      return {
        id: savedMovie.id,
        title: savedMovie.title,
        genre: savedMovie.genre,
        duration: savedMovie.duration,
        rating: savedMovie.rating,
        releaseYear: savedMovie.releaseYear
      };
    } catch (error) {
      // Handle database-level unique constraint errors
      if (error.code === '23505') { // PostgreSQL unique violation code
        throw new ConflictException(`A movie with the title "${createMovieDto.title}" already exists`);
      }
      throw error;
    }
  }

  async update(movieTitle: string, updateMovieDto: CreateMovieDto): Promise<void> {
    const movie = await this.moviesRepository.findOne({ where: { title: movieTitle } });
    if (!movie) {
      throw new NotFoundException(`Movie with title ${movieTitle} not found`);
    }
    if (updateMovieDto.title && updateMovieDto.title !== movieTitle) {
      const existingMovie = await this.moviesRepository.findOne({ 
        where: { title: updateMovieDto.title } 
      });
      
      if (existingMovie) {
        throw new ConflictException(`A movie with the title "${updateMovieDto.title}" already exists`);
      }
    }
    await this.moviesRepository.update({ title: movieTitle }, updateMovieDto);
  }

  async delete(movieTitle: string): Promise<void> {
    const result = await this.moviesRepository.delete({ title: movieTitle });
    if (result.affected === 0) {
      throw new NotFoundException(`Movie with title ${movieTitle} not found`);
    }
  }
}