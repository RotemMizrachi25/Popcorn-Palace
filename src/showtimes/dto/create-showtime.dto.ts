// src/showtimes/dto/create-showtime.dto.ts
import { IsNotEmpty, IsNumber, IsDateString, IsString, Min, Matches } from 'class-validator';

export class CreateShowtimeDto {
  @IsNotEmpty()
  @IsNumber()
  movieId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsString()
  theater: string;

  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/, {
  message: 'startTime must be a full ISO date with timezone (e.g. 2025-02-14T11:47:46.125405Z)'})  
  startTime: string;

  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/, {
    message: 'startTime must be a full ISO date with timezone (e.g. 2025-02-14T11:47:46.125405Z)'})
  endTime: string;
}