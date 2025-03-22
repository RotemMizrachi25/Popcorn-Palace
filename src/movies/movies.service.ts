import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.moviesRepository.find();
  }


  // src/movies/movies.service.ts
 async findOne(id: number): Promise<Movie> {
    const movie = await this.moviesRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
    return movie;
  }

  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    const movie = this.moviesRepository.create(createMovieDto);
    return this.moviesRepository.save(movie);
  }

  async update(movieTitle: string, updateMovieDto: CreateMovieDto): Promise<void> {
    const movie = await this.moviesRepository.findOne({ where: { title: movieTitle } });
    if (!movie) {
      throw new NotFoundException(`Movie with title ${movieTitle} not found`);
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