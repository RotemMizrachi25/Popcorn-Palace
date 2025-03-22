import { Controller, Get, Post, Body, Param, Delete , HttpCode} from '@nestjs/common';
import { ShowtimesService } from './showtimes.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { Showtime } from './entities/showtime.entity';

@Controller('showtimes')
export class ShowtimesController {
  constructor(private readonly showtimesService: ShowtimesService) {}

  @Get(':showtimeId')
  findById(@Param('showtimeId') id: number): Promise<Showtime> {
    return this.showtimesService.findById(id);
  }

  @Post()
  @HttpCode(200)
  create(@Body() createShowtimeDto: CreateShowtimeDto): Promise<Showtime> {
    return this.showtimesService.create(createShowtimeDto);
  }

  @Post('update/:showtimeId')
  @HttpCode(200)
  update(
    @Param('showtimeId') id: number,
    @Body() updateShowtimeDto: CreateShowtimeDto,
  ): Promise<void> {
    return this.showtimesService.update(id, updateShowtimeDto);
  }

  @Delete(':showtimeId')
  delete(@Param('showtimeId') id: number): Promise<void> {
    return this.showtimesService.delete(id);
  }
}