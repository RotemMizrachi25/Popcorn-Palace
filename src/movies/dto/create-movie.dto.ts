import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMovieDto {
  @ApiProperty({ 
    description: 'The title of the movie',
    example: 'The Matrix' 
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ 
    description: 'The genre of the movie',
    example: 'Action' 
  })
  @IsNotEmpty()
  @IsString()
  genre: string;

  @ApiProperty({ 
    description: 'The duration of the movie in minutes',
    example: 120,
    minimum: 1 
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({ 
    description: 'The rating of the movie (0-10)',
    example: 8.7,
    minimum: 0,
    maximum: 10 
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(10)
  rating: number;

  @ApiProperty({ 
    description: 'The year the movie was released',
    example: 2025 
  })
  @IsNotEmpty()
  @IsNumber()
  releaseYear: number;
}