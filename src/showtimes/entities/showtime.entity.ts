import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Showtime {
  @ApiProperty({ example: 1, description: 'The unique identifier of the showtime' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 50.2, description: 'The ticket price for this showtime' })
  @Column('float')
  price: number;

  @ApiProperty({ example: 1, description: 'The ID of the movie being shown' })
  @Column()
  movieId: number;

  @ApiProperty({ example: 'Sample Theater', description: 'The theater where the movie is showing' })
  @Column()
  theater: string;

  @ApiProperty({ 
    example: '2025-02-14T11:47:46.125Z', 
    description: 'The start time of the showtime' 
  })
  @Column('timestamp')
  startTime: Date;

  @ApiProperty({ 
    example: '2025-02-14T14:47:46.125Z', 
    description: 'The end time of the showtime' 
  })
  @Column('timestamp')
  endTime: Date;
}