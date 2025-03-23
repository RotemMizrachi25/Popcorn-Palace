import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Movie {
  @ApiProperty({ example: 1, description: 'The unique identifier of the movie' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'The Matrix', description: 'The title of the movie' })
  @Column({ unique: true })
  title: string;

  @ApiProperty({ example: 'Action', description: 'The genre of the movie' })
  @Column()
  genre: string;

  @ApiProperty({ example: 120, description: 'The duration of the movie in minutes' })
  @Column()
  duration: number;

  @ApiProperty({ example: 8.7, description: 'The rating of the movie (0-10)' })
  @Column('float')
  rating: number;

  @ApiProperty({ example: 2025, description: 'The year the movie was released' })
  @Column()
  releaseYear: number;
}