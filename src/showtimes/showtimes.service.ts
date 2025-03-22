import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';
import { Showtime } from './entities/showtime.entity';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { MoviesService } from '../movies/movies.service';

@Injectable()
export class ShowtimesService {
  constructor(
    @InjectRepository(Showtime)
    private showtimesRepository: Repository<Showtime>,
    private moviesService: MoviesService,
  ) {}

  async findById(id: number): Promise<Showtime> {
    const showtime = await this.showtimesRepository.findOne({
      where: { id },
      relations: ['movie'],
    });
    if (!showtime) {
      throw new NotFoundException(`Showtime with ID ${id} not found`);
    }
    return showtime;
  }

  async create(createShowtimeDto: CreateShowtimeDto): Promise<Showtime> {
    // Verify the movie exists
    await this.moviesService.findOne(createShowtimeDto.movieId);

    // Check for overlapping showtimes in the same theater
    const startTime = new Date(createShowtimeDto.startTime);
    const endTime = new Date(createShowtimeDto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const overlappingShowtime = await this.showtimesRepository.findOne({
      where: [
        {
          theater: createShowtimeDto.theater,
          startTime: LessThanOrEqual(endTime),
          endTime: MoreThanOrEqual(startTime),
        },
      ],
    });

    if (overlappingShowtime) {
      throw new BadRequestException(
        `There is already a showtime in theater ${createShowtimeDto.theater} during this time period`,
      );
    }

    const showtime = this.showtimesRepository.create({
      ...createShowtimeDto,
      startTime,
      endTime,
    });

    return this.showtimesRepository.save(showtime);
  }

  async update(id: number, updateShowtimeDto: CreateShowtimeDto): Promise<void> {
    const showtime = await this.findById(id);

    // Verify the movie exists if movieId is being updated
    if (updateShowtimeDto.movieId) {
      await this.moviesService.findOne(updateShowtimeDto.movieId);
    }

    // Check for overlapping showtimes in the same theater
    const startTime = new Date(updateShowtimeDto.startTime);
    const endTime = new Date(updateShowtimeDto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const overlappingShowtime = await this.showtimesRepository.findOne({
      where: [
        {
          id: Not(id),
          theater: updateShowtimeDto.theater,
          startTime: LessThanOrEqual(endTime),
          endTime: MoreThanOrEqual(startTime),
        },
      ],
    });

    if (overlappingShowtime) {
      throw new BadRequestException(
        `There is already a showtime in theater ${updateShowtimeDto.theater} during this time period`,
      );
    }

    await this.showtimesRepository.update(id, {
      ...updateShowtimeDto,
      startTime,
      endTime,
    });
  }

  async delete(id: number): Promise<void> {
    const result = await this.showtimesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Showtime with ID ${id} not found`);
    }
  }
}