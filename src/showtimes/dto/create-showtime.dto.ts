import { IsNotEmpty, IsNumber, IsString, Min, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShowtimeDto {
  @ApiProperty({
    description: 'ID of the movie for this showtime',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  movieId: number;

  @ApiProperty({
    description: 'Price of the ticket for this showtime',
    example: 20.2,
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Name of the theater where the movie is showing',
    example: 'Sample Theater'
  })
  @IsNotEmpty()
  @IsString()
  theater: string;

  @ApiProperty({
    description: 'Start time of the showtime in ISO format with timezone',
    example: '2025-02-14T11:47:46.125Z'
  })
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/, {
    message: 'startTime must be a full ISO date with timezone (e.g. 2025-02-14T11:47:46.125Z)'
  })
  startTime: string;

  @ApiProperty({
    description: 'End time of the showtime in ISO format with timezone',
    example: '2025-02-14T14:47:46.125Z'
  })
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/, {
    message: 'endTime must be a full ISO date with timezone (e.g. 2025-02-14T14:47:46.125Z)'
  })
  endTime: string;
}