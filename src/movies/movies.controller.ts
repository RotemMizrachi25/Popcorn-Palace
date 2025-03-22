import { Controller, Get, Post, Body, HttpCode, Param, Delete } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { Movie } from './entities/movie.entity';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('all')
  findAll(): Promise<Movie[]> {
    return this.moviesService.findAll();
  }

  @Post()
  @HttpCode(200)
  create(@Body() createMovieDto: CreateMovieDto): Promise<Movie> {
    return this.moviesService.create(createMovieDto);
  }

  @Post('update/:movieTitle')
  @HttpCode(200)
  update(
    @Param('movieTitle') movieTitle: string,
    @Body() updateMovieDto: CreateMovieDto,
  ): Promise<void> {
    return this.moviesService.update(movieTitle, updateMovieDto);
  }

  @Delete(':movieTitle')
  delete(@Param('movieTitle') movieTitle: string): Promise<void> {
    return this.moviesService.delete(movieTitle);
  }
}