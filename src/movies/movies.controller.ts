import { Controller, Get, Post, Body, Param, Delete, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { Movie } from './entities/movie.entity';

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @ApiOperation({ summary: 'Get all movies' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all movies',
    type: [Movie] 
  })
  @Get('all')
  findAll(): Promise<Movie[]> {
    return this.moviesService.findAll();
  }

  @ApiOperation({ summary: 'Create a new movie' })
  @ApiResponse({ 
    status: 200, 
    description: 'The movie has been successfully created',
    type: Movie 
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Movie with the same title already exists' })
  @Post()
  @HttpCode(200)
  create(@Body() createMovieDto: CreateMovieDto): Promise<Movie> {
    return this.moviesService.create(createMovieDto);
  }

  @ApiOperation({ summary: 'Update a movie by title' })
  @ApiParam({ name: 'movieTitle', description: 'Title of the movie to update' })
  @ApiResponse({ status: 200, description: 'The movie has been successfully updated' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  @ApiResponse({ status: 409, description: 'Movie with the new title already exists' })
  @Post('update/:movieTitle')
  @HttpCode(200)
  update(
    @Param('movieTitle') movieTitle: string,
    @Body() updateMovieDto: CreateMovieDto,
  ): Promise<void> {
    return this.moviesService.update(movieTitle, updateMovieDto);
  }

  @ApiOperation({ summary: 'Delete a movie by title' })
  @ApiParam({ name: 'movieTitle', description: 'Title of the movie to delete' })
  @ApiResponse({ status: 200, description: 'The movie has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  @Delete(':movieTitle')
  @HttpCode(200)
  delete(@Param('movieTitle') movieTitle: string): Promise<void> {
    return this.moviesService.delete(movieTitle);
  }
}