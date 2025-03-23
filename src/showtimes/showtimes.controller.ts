import { Controller, Get, Post, Body, Param, Delete, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ShowtimesService } from './showtimes.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';

@ApiTags('showtimes')
@Controller('showtimes')
export class ShowtimesController {
  constructor(private readonly showtimesService: ShowtimesService) {}

  @ApiOperation({ summary: 'Get showtime by ID' })
  @ApiParam({ name: 'showtimeId', description: 'ID of the showtime' })
  @ApiResponse({ 
    status: 200, 
    description: 'The showtime details',
    schema: {
      properties: {
        id: { type: 'number' },
        price: { type: 'number' },
        movieId: { type: 'number' },
        theater: { type: 'string' },
        startTime: { type: 'string', format: 'date-time' },
        endTime: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Showtime not found' })
  @Get(':showtimeId')
  findById(@Param('showtimeId') id: number): Promise<any> {
    return this.showtimesService.findById(id);
  }

  @ApiOperation({ summary: 'Create a new showtime' })
  @ApiResponse({ 
    status: 200, 
    description: 'The showtime has been successfully created',
    schema: {
      properties: {
        id: { type: 'number' },
        price: { type: 'number' },
        movieId: { type: 'number' },
        theater: { type: 'string' },
        startTime: { type: 'string', format: 'date-time' },
        endTime: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input or overlapping showtime' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  @Post()
  @HttpCode(200)
  create(@Body() createShowtimeDto: CreateShowtimeDto): Promise<any> {
    return this.showtimesService.create(createShowtimeDto);
  }

  @ApiOperation({ summary: 'Update a showtime' })
  @ApiParam({ name: 'showtimeId', description: 'ID of the showtime to update' })
  @ApiResponse({ status: 200, description: 'The showtime has been successfully updated' })
  @ApiResponse({ status: 400, description: 'Invalid input or overlapping showtime' })
  @ApiResponse({ status: 404, description: 'Showtime or movie not found' })
  @Post('update/:showtimeId')
  @HttpCode(200)
  update(
    @Param('showtimeId') id: number,
    @Body() updateShowtimeDto: CreateShowtimeDto,
  ): Promise<void> {
    return this.showtimesService.update(id, updateShowtimeDto);
  }

  @ApiOperation({ summary: 'Delete a showtime' })
  @ApiParam({ name: 'showtimeId', description: 'ID of the showtime to delete' })
  @ApiResponse({ status: 200, description: 'The showtime has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'Showtime not found' })
  @Delete(':showtimeId')
  @HttpCode(200)
  delete(@Param('showtimeId') id: number): Promise<void> {
    return this.showtimesService.delete(id);
  }
}